namespace SmartApiary.Application.DTOs;

public class TelemetryReadingDto
{
    public Guid Id { get; set; }

    public Guid HiveId { get; set; }

    public Guid DeviceId { get; set; }

    public DateTime Timestamp { get; set; }

    public double WeightKg { get; set; }

    public double HumidityPercent { get; set; }

    public double TemperatureCelsius { get; set; }

    public double BatteryPercent { get; set; }
}
