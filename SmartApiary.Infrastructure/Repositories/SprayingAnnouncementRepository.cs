using Microsoft.EntityFrameworkCore;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.Models;
using SmartApiary.Infrastructure.Persistence;

namespace SmartApiary.Infrastructure.Repositories;

public class SprayingAnnouncementRepository : ISprayingAnnouncementRepository
{
    private readonly SmartApiaryDbContext _context;

    public SprayingAnnouncementRepository(SmartApiaryDbContext context)
    {
        _context = context;
    }

    public Task<SprayingAnnouncement?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return _context.SprayingAnnouncements.FirstOrDefaultAsync(
            announcement => announcement.Id == id,
            cancellationToken);
    }

    public async Task<IReadOnlyList<SprayingAnnouncement>> GetByParcelIdAsync(
        Guid parcelId,
        CancellationToken cancellationToken = default)
    {
        return await _context.SprayingAnnouncements
            .Where(announcement => announcement.ParcelId == parcelId)
            .OrderByDescending(announcement => announcement.StartTime)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(SprayingAnnouncement announcement, CancellationToken cancellationToken = default)
    {
        await _context.SprayingAnnouncements.AddAsync(announcement, cancellationToken);
    }

    public void Update(SprayingAnnouncement announcement)
    {
        _context.SprayingAnnouncements.Update(announcement);
    }

    public async Task<IReadOnlyList<SprayingAnnouncement>> GetExpiredScheduledSprayingsAsync(
        CancellationToken cancellationToken = default)
    {
        return await _context.SprayingAnnouncements
            .Where(announcement => announcement.Status == SprayingStatus.Scheduled 
                                && announcement.StartTime.AddHours(announcement.DurationHours) <= DateTime.UtcNow)
            .ToListAsync(cancellationToken);
    }

    public async Task<(IReadOnlyList<SprayingAnnouncement> Items, int TotalCount)> GetFilteredSprayingsAsync(
        Guid parcelId, DateTime? fromDate, DateTime? toDate, int pageNumber, int pageSize, CancellationToken cancellationToken = default)
    {
        var query = _context.SprayingAnnouncements.Where(x => x.ParcelId == parcelId);

        if (fromDate.HasValue)
            query = query.Where(x => x.StartTime >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(x => x.StartTime <= toDate.Value);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(x => x.StartTime)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }
}
