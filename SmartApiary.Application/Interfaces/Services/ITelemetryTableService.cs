using SmartApiary.Domain.Models;

namespace SmartApiary.Application.Interfaces.Services;

public interface ITelemetryTableService
{
    Task InsertAsync(TelemetryReading reading, CancellationToken cancellationToken = default);
}