namespace PhotoOrderApi.Models
{
    public class Payment
    {
        public int PaymentId { get; set; }
        public string OrderId { get; set; } = null!;
        public Order Order { get; set; } = null!;
        public string PaymentMethod { get; set; } = null!;
        public double Amount { get; set; }
        public DateTime PaymentDate { get; set; } = DateTime.UtcNow;
        public string? PaymentStatus { get; set; }
    }
}