// Podaci koje saljemo frontu za ApiaryDto.

namespace SmartApiary.Application.DTOs;

public class ApiaryDto
{
    public Guid Id { get; set; }

    public Guid BeekeeperId { get; set; }

    public string Name { get; set; } = string.Empty;

    public double Latitude { get; set; }

    public double Longitude { get; set; }

    public string? TerrainDescription { get; set; }

    public string? ImageUrl { get; set; }

    public string? ThumbnailUrl { get; set; }

    public DateTime CreatedAt { get; set; }
}
