namespace SmartApiary.Infrastructure.TableStorage;

internal sealed class AzureTableOptions
{
    public const string SectionName = "AzureStorage";

    public string ConnectionString { get; init; } = string.Empty;

    public string TelemetryTable { get; init; } = "Telemetries";
}
