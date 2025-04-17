namespace PhotoOrderApi.Models
{
    public class Image
    {
        public int ImageId { get; set; }
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        public string FilePath { get; set; } = string.Empty;
        public DateTime UploadDate { get; set; } = DateTime.UtcNow;
        public string? Description { get; set; }
    }
}