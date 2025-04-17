using System.Text.Json.Serialization;
public class OrderItemDto
{
    [JsonPropertyName("file_field")]
    public string FileField { get; set; } = "";

    [JsonPropertyName("size")]
    public string Size { get; set; } = "";

    [JsonPropertyName("quantity")]
    public int Quantity { get; set; }

    [JsonPropertyName("unit_price")]
    public double UnitPrice { get; set; }
}