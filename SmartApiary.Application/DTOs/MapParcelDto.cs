// Podaci koje saljemo frontu za MapParcelDto.

namespace SmartApiary.Application.DTOs;

public sealed class MapParcelDto
{
    public Guid ParcelId { get; set; }

    public string ParcelName { get; set; } = string.Empty;

    public double Latitude { get; set; }

    public double Longitude { get; set; }

    public string FarmerName { get; set; } = string.Empty;

    public string FarmerPhone { get; set; } = string.Empty;

    public IReadOnlyList<MapCropDto> Crops { get; set; } = Array.Empty<MapCropDto>();
}
