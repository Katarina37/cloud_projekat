using Azure;
using Azure.Data.Tables;

namespace SmartApiary.Infrastructure.TableStorage;

public sealed class TelemetryTableEntity : ITableEntity
{
    public string PartitionKey { get; set; } = default!;
    public string RowKey { get; set; } = default!;      
    public DateTimeOffset? Timestamp { get; set; }
    public ETag ETag { get; set; }

    public Guid HiveId { get; set; }
    public Guid DeviceId { get; set; }
    public DateTime ReadingTimestamp { get; set; }
    public double WeightKg { get; set; }
    public double HumidityPercent { get; set; }
    public double TemperatureCelsius { get; set; }
    public double BatteryPercent { get; set; }
}