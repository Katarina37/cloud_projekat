using SmartApiary.Domain.Models;

namespace SmartApiary.Infrastructure.TableStorage;

internal sealed class TelemetryTableMapper
    : ITableMapper<TelemetryReading, TelemetryTableEntity>
{
    public TelemetryTableEntity ToEntity(TelemetryReading domain)
    {
        return new TelemetryTableEntity
        {
            HiveId = domain.HiveId,
            ReadingTimestamp = domain.Timestamp,
            WeightKg = domain.WeightKg,
            HumidityPercent = domain.HumidityPercent,
            TemperatureCelsius = domain.TemperatureCelsius,
            BatteryPercent = domain.BatteryPercent
        };
    }

    public TelemetryReading? ToDomain(TelemetryTableEntity entity)
    {
        var separatorIndex = entity.RowKey.IndexOf('_');
        if (separatorIndex < 0
            || !Guid.TryParse(entity.RowKey[(separatorIndex + 1)..], out var readingId)
            || !Guid.TryParse(entity.PartitionKey, out var deviceId))
        {
            return null;
        }

        return TelemetryReading.Load(
            readingId,
            entity.HiveId,
            deviceId,
            entity.ReadingTimestamp,
            entity.WeightKg,
            entity.HumidityPercent,
            entity.TemperatureCelsius,
            entity.BatteryPercent);
    }
}
