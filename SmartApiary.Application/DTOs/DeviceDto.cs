namespace SmartApiary.Application.DTOs;

public class DeviceDto
{
    public Guid Id { get; set; }

    public Guid HiveId { get; set; }

    public string SerialNumber { get; set; } = string.Empty;

    public string? DeviceIdentifier { get; set; }

    public string Status { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public DateTime? PairedAt { get; set; }
}
