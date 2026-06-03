using Azure.Data.Tables;
using Microsoft.Extensions.Configuration;
using SmartApiary.Application.Interfaces.Services;
using SmartApiary.Domain.Models;

namespace SmartApiary.Infrastructure.TableStorage;

public sealed class TelemetryTableService : ITelemetryTableService
{
    private const string TableName = "TelemetryReadings";
    private readonly TableClient _tableClient;

    public TelemetryTableService(IConfiguration configuration)
    {
        var connectionString = configuration["AzureStorage:ConnectionString"]
            ?? throw new InvalidOperationException("AzureStorage:ConnectionString is not configured.");

        _tableClient = new TableClient(connectionString, TableName);
        _tableClient.CreateIfNotExists();
    }

    public async Task InsertAsync(TelemetryReading reading, CancellationToken cancellationToken = default)
    {
        var entity = new TelemetryTableEntity
        {
            PartitionKey = reading.HiveId.ToString(),
            RowKey = (DateTime.MaxValue.Ticks - reading.Timestamp.Ticks).ToString("D20"),
            HiveId = reading.HiveId,
            DeviceId = reading.DeviceId,
            ReadingTimestamp = reading.Timestamp,
            WeightKg = reading.WeightKg,
            HumidityPercent = reading.HumidityPercent,
            TemperatureCelsius = reading.TemperatureCelsius,
            BatteryPercent = reading.BatteryPercent
        };

        await _tableClient.AddEntityAsync(entity, cancellationToken);
    }
}