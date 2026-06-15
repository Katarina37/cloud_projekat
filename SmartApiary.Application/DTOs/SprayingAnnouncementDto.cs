// Podaci koje saljemo frontu za SprayingAnnouncementDto.

namespace SmartApiary.Application.DTOs;

public class SprayingAnnouncementDto
{
    public Guid Id { get; set; }

    public Guid ParcelId { get; set; }

    public string ParcelName { get; set; } = string.Empty;

    public DateTime StartTime { get; set; }

    public int DurationHours { get; set; }

    public string? PreparationType { get; set; }

    public string Status { get; set; } = string.Empty;

    public int NotifiedBeekeepersCount { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? CancelledAt { get; set; }

    public DateTime? ActualStartTime { get; set; }

    public DateTime? ActualEndTime { get; set; }

    public Guid? CropId { get; set; }

    public string? CropName { get; set; }

    public string? Note { get; set; }

    public string FarmerName { get; set; } = string.Empty;

    public WeatherInfoDto? WeatherSnapshot { get; set; }
}
