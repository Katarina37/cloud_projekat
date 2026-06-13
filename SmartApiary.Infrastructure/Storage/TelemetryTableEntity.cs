namespace SmartApiary.Infrastructure.TableStorage;

internal sealed class TelemetryTableEntity : BaseTableEntity
{
    public Guid HiveId { get; set; }

    public DateTime ReadingTimestamp { get; set; }

    public double WeightKg { get; set; }

    public double HumidityPercent { get; set; }

    public double TemperatureCelsius { get; set; }

    public double BatteryPercent { get; set; }
}
