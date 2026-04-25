namespace SmartApiary.Application.DTOs;

public class SprayingAnnouncementDto
{
    public Guid Id { get; set; }

    public Guid ParcelId { get; set; }

    public DateTime StartTime { get; set; }

    public int DurationHours { get; set; }

    public string? PreparationType { get; set; }

    public string Status { get; set; } = string.Empty;

    public int NotifiedBeekeepersCount { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? CancelledAt { get; set; }
}
