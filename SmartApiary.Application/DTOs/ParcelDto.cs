// Podaci koje saljemo frontu za ParcelDto.

namespace SmartApiary.Application.DTOs;

public class ParcelDto
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public double Latitude { get; set; }

    public double Longitude { get; set; }

    public DateTime CreatedAt { get; set; }
}
