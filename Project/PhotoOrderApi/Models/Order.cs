namespace PhotoOrderApi.Models
{
    public class Order
    {
        public string OrderId { get; set; } = Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N");
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        public double TotalAmount { get; set; }
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;
        public string PaymentStatus { get; set; } = "chưa thanh toán";
        public string? OrderNote { get; set; }

        public ICollection<OrderDetail>? OrderDetails { get; set; }
        public OrderStatus? OrderStatus { get; set; }
        public Payment? Payment { get; set; }
    }
}