using Microsoft.EntityFrameworkCore;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Models;
using SmartApiary.Infrastructure.Persistence;

namespace SmartApiary.Infrastructure.Repositories;

public class TelemetryRepository : ITelemetryRepository
{
    private readonly SmartApiaryDbContext _context;

    public TelemetryRepository(SmartApiaryDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(TelemetryReading reading, CancellationToken cancellationToken = default)
    {
        await _context.TelemetryReadings.AddAsync(reading, cancellationToken);
    }

    public Task<TelemetryReading?> GetLatestForHiveAsync(
        Guid hiveId,
        CancellationToken cancellationToken = default)
    {
        return _context.TelemetryReadings
            .Where(reading => reading.HiveId == hiveId)
            .OrderByDescending(reading => reading.Timestamp)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public Task<TelemetryReading?> GetPreviousForHiveAsync(
        Guid hiveId,
        DateTime before,
        CancellationToken cancellationToken = default)
    {
        return _context.TelemetryReadings
            .Where(reading => reading.HiveId == hiveId && reading.Timestamp < before)
            .OrderByDescending(reading => reading.Timestamp)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<TelemetryReading>> GetForHiveAsync(
        Guid hiveId,
        DateTime from,
        DateTime to,
        CancellationToken cancellationToken = default)
    {
        return await _context.TelemetryReadings
            .Where(reading => reading.HiveId == hiveId)
            .Where(reading => reading.Timestamp >= from && reading.Timestamp <= to)
            .OrderBy(reading => reading.Timestamp)
            .ToListAsync(cancellationToken);
    }
}
