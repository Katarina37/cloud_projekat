namespace SmartApiary.Application.DTOs;

public class CropDto
{
    public Guid Id { get; set; }

    public Guid ParcelId { get; set; }

    public string Name { get; set; } = string.Empty;

    public DateTime ExpectedBloomingStart { get; set; }

    public DateTime ExpectedBloomingEnd { get; set; }

    public double? Area { get; set; }

    public string? Notes { get; set; }
}
