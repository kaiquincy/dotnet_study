namespace PhotoOrderApi.Models
{
    public class OrderStatus
    {
        public int OrderStatusId { get; set; }
        public string OrderId { get; set; } = null!;
        public Order Order { get; set; } = null!;
        public bool IsApproved { get; set; }
        public bool IsShipping { get; set; }
        public bool IsDelivered { get; set; }
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public int? AdminId { get; set; }
    }
}