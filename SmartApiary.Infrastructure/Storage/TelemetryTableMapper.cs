// Jedan deo podrske za Table Storage: TelemetryTableMapper.
// Specifikacija - telemetriju drzimo van SQL baze.
// Vezbe 4 - PartitionKey, RowKey i mapiranje Table entiteta.

using SmartApiary.Domain.Models;

namespace SmartApiary.Infrastructure.TableStorage;

internal sealed class TelemetryTableMapper
    : ITableMapper<TelemetryReading, TelemetryTableEntity>
{
    public TelemetryTableEntity ToEntity(TelemetryReading domain)
    {
        // Prebacujemo domen u format za Table Storage.
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
        // Iz kljuceva vratimo id merenja i uredjaja, pa sklopimo domen.
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
