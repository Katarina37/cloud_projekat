// Ovde upisujemo i citamo telemetriju iz Table Storage-a.
// Specifikacija - cuvanje IoT merenja.
// Vezbe 4 - Table Storage repozitorijum.

using Azure.Data.Tables;
using Microsoft.Extensions.Options;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Models;
using SmartApiary.Infrastructure.TableStorage;

namespace SmartApiary.Infrastructure.Repositories;

internal sealed class TelemetryRepository : ITelemetryRepository
{
    private readonly ITableKeyProvider<TelemetryReading> _keyProvider;
    private readonly ITableMapper<TelemetryReading, TelemetryTableEntity> _mapper;
    private readonly TableClient _tableClient;

    public TelemetryRepository(
        TableServiceClient tableServiceClient,
        ITableKeyProvider<TelemetryReading> keyProvider,
        ITableMapper<TelemetryReading, TelemetryTableEntity> mapper,
        IOptions<AzureTableOptions> options)
    {
        _keyProvider = keyProvider;
        _mapper = mapper;
        _tableClient = tableServiceClient.GetTableClient(options.Value.TelemetryTable);

        // Napravi tabelu ako vec ne postoji.
        _tableClient.CreateIfNotExists();
    }

    public async Task AddAsync(
        TelemetryReading reading,
        CancellationToken cancellationToken = default)
    {
        // Pre upisa pravimo Table entitet i njegove kljuceve.
        var entity = _mapper.ToEntity(reading);
        entity.PartitionKey = _keyProvider.GetPartitionKey(reading);
        entity.RowKey = _keyProvider.GetRowKey(reading);

        await _tableClient.AddEntityAsync(entity, cancellationToken);
    }

    public async Task<TelemetryReading?> GetLatestAsync(
        Guid deviceId,
        CancellationToken cancellationToken = default)
    {
        // PartitionKey je uredjaj, a najnoviji RowKey dolazi prvi.
        var partitionKey = deviceId.ToString();
        // Trazimo samo merenja ovog uredjaja.
        var entities = _tableClient.QueryAsync<TelemetryTableEntity>(
            entity => entity.PartitionKey == partitionKey,
            maxPerPage: 1,
            cancellationToken: cancellationToken);

        await foreach (var entity in entities.WithCancellation(cancellationToken))
        {
            return _mapper.ToDomain(entity);
        }

        return null;
    }

    public async Task<TelemetryReading?> GetPreviousAsync(
        Guid deviceId,
        DateTime before,
        CancellationToken cancellationToken = default)
    {
        var partitionKey = deviceId.ToString();
        var entities = _tableClient.QueryAsync<TelemetryTableEntity>(
            entity => entity.PartitionKey == partitionKey
                && entity.ReadingTimestamp < before,
            maxPerPage: 1,
            cancellationToken: cancellationToken);

        await foreach (var entity in entities.WithCancellation(cancellationToken))
        {
            return _mapper.ToDomain(entity);
        }

        return null;
    }

    public async Task<IReadOnlyList<TelemetryReading>> GetByDeviceAsync(
        Guid deviceId,
        DateTime from,
        DateTime to,
        CancellationToken cancellationToken = default)
    {
        var partitionKey = deviceId.ToString();
        var entities = _tableClient.QueryAsync<TelemetryTableEntity>(
            entity => entity.PartitionKey == partitionKey
                && entity.ReadingTimestamp >= from
                && entity.ReadingTimestamp <= to,
            cancellationToken: cancellationToken);
        var readings = new List<TelemetryReading>();

        await foreach (var entity in entities.WithCancellation(cancellationToken))
        {
            var reading = _mapper.ToDomain(entity);
            if (reading is not null)
            {
                readings.Add(reading);
            }
        }

        return readings
            .OrderBy(reading => reading.Timestamp)
            .ToList();
    }
}
