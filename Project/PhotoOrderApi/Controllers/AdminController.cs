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
    [Route("admin/orders")]
    [Authorize]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _ctx;
        public AdminController(AppDbContext ctx) => _ctx = ctx;

        private bool CheckAdmin() => bool.Parse(User.FindFirst("isAdmin")!.Value);

        [HttpGet]
        public IActionResult GetPending()
        {
            if (!CheckAdmin()) return Forbid();
            var list = _ctx.Orders
                .Include(o => o.User)
                .Include(o => o.OrderStatus)
                .Where(o => !o.OrderStatus!.IsApproved)
                .Select(o => new {
                    o.OrderId,
                    userEmail = o.User.Email,
                    total = o.TotalAmount,
                    paymentMethod = o.Payment!.PaymentMethod
                });
            return Ok(new { orders = list });
        }

        [HttpPost("{orderId}/process")]  
        public async Task<IActionResult> Process(string orderId)
        {
            if (!CheckAdmin()) return Forbid();
            var status = await _ctx.OrderStatuses.FirstOrDefaultAsync(s => s.OrderId == orderId);
            if (status == null) return NotFound();
            status.IsApproved = true;
            await _ctx.SaveChangesAsync();
            return Ok(new { message = "Order marked as processed", orderId });
        }

        [HttpPatch("{orderId}/status")]
        public async Task<IActionResult> UpdateStatus(string orderId, [FromBody] UpdateStatusDto dto)
        {
            if (!CheckAdmin()) return Forbid();
            var status = await _ctx.OrderStatuses.FirstOrDefaultAsync(s => s.OrderId == orderId);
            if (status == null) return NotFound();
            if (dto.IsApproved.HasValue) status.IsApproved = dto.IsApproved.Value;
            if (dto.IsShipping.HasValue) status.IsShipping = dto.IsShipping.Value;
            if (dto.IsDelivered.HasValue) status.IsDelivered = dto.IsDelivered.Value;
            if (dto.AdminId.HasValue)    status.AdminId = dto.AdminId;
            status.UpdatedAt = DateTime.UtcNow;
            await _ctx.SaveChangesAsync();
            return Ok(new { message = "Status updated", orderId });
        }
    }
}