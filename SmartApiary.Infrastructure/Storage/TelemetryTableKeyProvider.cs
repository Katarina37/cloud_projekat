using SmartApiary.Domain.Models;

namespace SmartApiary.Infrastructure.TableStorage;

internal sealed class TelemetryTableKeyProvider : ITableKeyProvider<TelemetryReading>
{
    public string GetPartitionKey(TelemetryReading model)
    {
        return model.DeviceId.ToString();
    }

    public string GetRowKey(TelemetryReading model)
    {
        var invertedTicks = (DateTime.MaxValue.Ticks - model.Timestamp.Ticks).ToString("d19");

        return $"{invertedTicks}_{model.Id}";
    }
}
