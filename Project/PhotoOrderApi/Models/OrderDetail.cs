namespace PhotoOrderApi.Models
{
    public class OrderDetail
    {
        public int OrderDetailId { get; set; }
        public string OrderId { get; set; } = null!;
        public Order Order { get; set; } = null!;
        public int ImageId { get; set; }
        public Image Image { get; set; } = null!;
        public string Size { get; set; } = null!;
        public int Quantity { get; set; }
        public double UnitPrice { get; set; }
        public double SubTotal { get; set; }
    }
}