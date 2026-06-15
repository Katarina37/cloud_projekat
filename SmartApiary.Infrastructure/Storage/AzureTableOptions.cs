// Jedan deo podrske za Table Storage: AzureTableOptions.
// Specifikacija - telemetriju drzimo van SQL baze.
// Vezbe 4 - PartitionKey, RowKey i mapiranje Table entiteta.

namespace SmartApiary.Infrastructure.TableStorage;

internal sealed class AzureTableOptions
{
    public const string SectionName = "AzureStorage";

    public string ConnectionString { get; init; } = string.Empty;

    public string TelemetryTable { get; init; } = "Telemetries";
}
