using SmartApiary.Domain.Models;

namespace SmartApiary.Application.Interfaces.Repositories;

public interface ITelemetryRepository
{
    Task AddAsync(TelemetryReading reading, CancellationToken cancellationToken = default);

    Task<TelemetryReading?> GetLatestAsync(
        Guid deviceId,
        CancellationToken cancellationToken = default);

    Task<TelemetryReading?> GetPreviousAsync(
        Guid deviceId,
        DateTime before,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<TelemetryReading>> GetByDeviceAsync(
        Guid deviceId,
        DateTime from,
        DateTime to,
        CancellationToken cancellationToken = default);
}
