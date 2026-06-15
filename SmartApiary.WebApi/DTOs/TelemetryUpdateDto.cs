// Podaci koje worker salje frontu preko SignalR-a.

namespace SmartApiary.WebApi.DTOs;

public sealed class TelemetryUpdateDto
{
    public Guid ApiaryId { get; set; }

    public Guid HiveId { get; set; }

    public Guid DeviceId { get; set; }

    public DateTime Timestamp { get; set; }

    public double Weight { get; set; }

    public double Temperature { get; set; }

    public double Humidity { get; set; }

    public double BatteryLevel { get; set; }
}
