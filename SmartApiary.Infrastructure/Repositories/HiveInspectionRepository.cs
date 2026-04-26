using Microsoft.EntityFrameworkCore;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Models;
using SmartApiary.Infrastructure.Persistence;

namespace SmartApiary.Infrastructure.Repositories;

public class HiveInspectionRepository : IHiveInspectionRepository
{
    private readonly SmartApiaryDbContext _context;

    public HiveInspectionRepository(SmartApiaryDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<HiveInspectionRecord>> GetByHiveIdAsync(
        Guid hiveId,
        CancellationToken cancellationToken = default)
    {
        return await _context.HiveInspectionRecords
            .Where(record => record.HiveId == hiveId)
            .ToListAsync(cancellationToken);
    }

    public Task<HiveInspectionRecord?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return _context.HiveInspectionRecords
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);
    }

    public async Task AddAsync(HiveInspectionRecord record, CancellationToken cancellationToken = default)
    {
        await _context.HiveInspectionRecords.AddAsync(record, cancellationToken);
    }

    public void Update(HiveInspectionRecord record)
    {
        _context.HiveInspectionRecords.Update(record);
    }

    public void Delete(HiveInspectionRecord record)
    {
        _context.HiveInspectionRecords.Remove(record);
    }
}
