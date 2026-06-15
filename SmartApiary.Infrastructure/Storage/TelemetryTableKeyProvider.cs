// Jedan deo podrske za Table Storage: TelemetryTableKeyProvider.
// Specifikacija - telemetriju drzimo van SQL baze.
// Vezbe 4 - PartitionKey, RowKey i mapiranje Table entiteta.

using SmartApiary.Domain.Models;

namespace SmartApiary.Infrastructure.TableStorage;

internal sealed class TelemetryTableKeyProvider : ITableKeyProvider<TelemetryReading>
{
    public string GetPartitionKey(TelemetryReading model)
    {
        // Sva merenja jednog uredjaja idu u istu particiju.
        return model.DeviceId.ToString();
    }

    public string GetRowKey(TelemetryReading model)
    {
        // Vezbe 4: obrnuto vreme stavlja najnovije merenje na vrh.
        var invertedTicks = (DateTime.MaxValue.Ticks - model.Timestamp.Ticks).ToString("d19");

        // Id na kraju cuva RowKey jedinstvenim.
        return $"{invertedTicks}_{model.Id}";
    }
}
