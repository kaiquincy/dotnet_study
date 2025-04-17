using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PhotoOrderApi.Data;
using PhotoOrderApi.DTOs;
using PhotoOrderApi.Models;
using System.Security.Claims;

namespace PhotoOrderApi.Controllers
{
    [ApiController]
    [Route("orders")]
    [Authorize]
    public class OrdersController : ControllerBase
    {
        private readonly AppDbContext _ctx;
        private readonly IWebHostEnvironment _env;
        private readonly ILogger<OrdersController> _logger;
        


        public OrdersController(AppDbContext ctx, IWebHostEnvironment env, ILogger<OrdersController> logger)
        {
            _ctx = ctx;
            _env = env;
            _logger = logger;
        }

        [HttpPost]
        [RequestSizeLimit(100_000_000)]
        public async Task<IActionResult> Create([FromForm] OrderCreateDto dto)
        {
            var userId = int.Parse(User.FindFirstValue("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")!);
            var order = new Order { UserId = userId, OrderNote = dto.OrderNote };
            _ctx.Orders.Add(order);
            await _ctx.SaveChangesAsync();

            var uploadDir = Path.Combine(_env.WebRootPath, "uploads");
            Directory.CreateDirectory(uploadDir);
            double total = 0;

            _logger.LogInformation("Raw order_items JSON: {json}", dto.ItemsJson);
            _logger.LogInformation("Parsed items count: {count}", dto.Items.Count);
            var allFiles = Request.Form.Files;
            _logger.LogInformation("Request.Form.Files count: {count}", allFiles.Count);
            
            foreach (var f in allFiles)
            {
                _logger.LogInformation("• Field Name: {field} | FileName: {filename}", f.Name, f.FileName);
            }

            foreach (var item in dto.Items)
            {

                var files = Request.Form.Files;
                IFormFile? file = files.FirstOrDefault(f => f.Name == item.FileField);
                
                if (file == null)
                    return BadRequest($"Missing file field: {item.FileField}");

                // var file = dto.Files.First(f => f.Name == item.FileField);
                var img = new Image { UserId = userId };
                _ctx.Images.Add(img);
                await _ctx.SaveChangesAsync();

                var ext = Path.GetExtension(file.FileName);
                var newName = $"{img.ImageId}{ext}";
                var fp = Path.Combine(uploadDir, newName);
                await using var fs = System.IO.File.Create(fp);
                await file.CopyToAsync(fs);
                img.FilePath = $"uploads/{newName}";

                var sub = item.Quantity * item.UnitPrice;
                total += sub;
                _ctx.OrderDetails.Add(new OrderDetail {
                    OrderId = order.OrderId,
                    ImageId = img.ImageId,
                    Size = item.Size,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice,
                    SubTotal = sub
                });
            }

            order.TotalAmount = total;
            _ctx.OrderStatuses.Add(new OrderStatus { OrderId = order.OrderId });
            await _ctx.SaveChangesAsync();

            return Ok(new { message = "Đơn hàng tạo thành công", orderId = order.OrderId, totalAmount = total });
        }

        [HttpGet]
        public IActionResult GetMy()
        {
            var userId = int.Parse(User.FindFirstValue("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")!);
            var list = _ctx.Orders
                .Where(o => o.UserId == userId)
                .Include(o => o.OrderDetails)
                .Include(o => o.OrderStatus)
                .ToList()
                .Select(o => new {
                    o.OrderId,
                    orderDate = o.OrderDate,
                    totalAmount = o.TotalAmount,
                    paymentStatus = o.PaymentStatus,
                    orderNote = o.OrderNote,
                    status = ComputeStatus(o.OrderStatus!),
                    orderDetails = o.OrderDetails.Select(d => new {
                        d.OrderDetailId, d.ImageId, d.Size, d.Quantity, d.UnitPrice, d.SubTotal
                    })
                });
            return Ok(new { orders = list });
        }

        [HttpGet("{id}")]
        public IActionResult GetById(string id)
        {
            var userId = int.Parse(User.FindFirstValue("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")!);
            var order = _ctx.Orders
                .Include(o => o.OrderDetails)
                .Include(o => o.OrderStatus)
                .Include(o => o.Payment)
                .FirstOrDefault(o => o.OrderId == id);
            if (order == null) return NotFound();
            if (order.UserId != userId && !bool.Parse(User.FindFirstValue("isAdmin")!))
                return Forbid();

            return Ok(new {
                order.OrderId,
                order.UserId,
                order.TotalAmount,
                order.OrderDate,
                paymentStatus = order.PaymentStatus,
                orderNote = order.OrderNote,
                orderDetails = order.OrderDetails.Select(d => new {
                    d.OrderDetailId, d.ImageId, d.Size, d.Quantity, d.UnitPrice, d.SubTotal
                }),
                paymentInfo = order.Payment is not null ? new {
                    order.Payment.PaymentId,
                    order.Payment.PaymentMethod,
                    order.Payment.Amount,
                    order.Payment.PaymentDate,
                    order.Payment.PaymentStatus
                } : null,
                orderStatus = order.OrderStatus is not null ? new {
                    order.OrderStatus.IsApproved,
                    order.OrderStatus.IsShipping,
                    order.OrderStatus.IsDelivered,
                    order.OrderStatus.UpdatedAt,
                    order.OrderStatus.AdminId
                } : null
            });
        }

        private static string ComputeStatus(OrderStatus s)
        {
            if (!s.IsApproved) return "pending";
            if (!s.IsShipping) return "processed";
            if (!s.IsDelivered) return "shipping";
            return "delivered";
        }
    }
}