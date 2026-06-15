// Podaci koje saljemo frontu za MapCropDto.

namespace SmartApiary.Application.DTOs;

public sealed class MapCropDto
{
    public Guid CropId { get; set; }

    public string Name { get; set; } = string.Empty;

    public DateTime ExpectedBloomingStart { get; set; }

    public DateTime ExpectedBloomingEnd { get; set; }

    public double? Area { get; set; }

    public string? Notes { get; set; }
}
