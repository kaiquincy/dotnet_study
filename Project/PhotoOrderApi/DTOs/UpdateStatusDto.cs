namespace PhotoOrderApi.DTOs
{
    public class UpdateStatusDto
    {
        public bool? IsApproved { get; set; }
        public bool? IsShipping { get; set; }
        public bool? IsDelivered { get; set; }
        public int? AdminId { get; set; }
    }
}