using SmartApiary.Domain.Models;

namespace SmartApiary.Application.Interfaces.Repositories;

public interface ITelemetryRepository
{
    Task AddAsync(TelemetryReading reading, CancellationToken cancellationToken = default);

    Task<TelemetryReading?> GetLatestForHiveAsync(Guid hiveId, CancellationToken cancellationToken = default);

    Task<TelemetryReading?> GetPreviousForHiveAsync(Guid hiveId, DateTime before, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<TelemetryReading>> GetForHiveAsync(Guid hiveId, DateTime from, DateTime to, CancellationToken cancellationToken = default);
}
