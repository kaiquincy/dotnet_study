using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

public class OrderCreateDto
    {
        // Nhận order_note từ form-data
        [FromForm(Name = "order_note")]
        public string OrderNote { get; set; } = string.Empty;

        // Nhận order_items (JSON array) dưới dạng string
        [FromForm(Name = "order_items")]
        public string ItemsJson { get; set; } = string.Empty;

        // Nhận tất cả file upload (với mọi key, ví dụ file1, file2,…)
        [FromForm]
        public List<IFormFile> Files { get; set; } = new();

        // Tự động deserialize ItemsJson thành List<OrderItemDto>
        public List<OrderItemDto> Items
        {
            get
            {
                if (string.IsNullOrWhiteSpace(ItemsJson))
                    return new List<OrderItemDto>();

                try
                {
                    return JsonSerializer.Deserialize<List<OrderItemDto>>(ItemsJson)
                           ?? new List<OrderItemDto>();
                }
                catch (JsonException)
                {
                    // Nếu JSON sai định dạng, trả về list rỗng (hoặc bạn có thể throw BadRequest ở Controller)
                    return new List<OrderItemDto>();
                }
            }
        }
    }