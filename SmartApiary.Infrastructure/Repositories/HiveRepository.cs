// SQL citanje i upis za Hive.

using Microsoft.EntityFrameworkCore;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Models;
using SmartApiary.Infrastructure.Persistence;

namespace SmartApiary.Infrastructure.Repositories;

public class HiveRepository : IHiveRepository
{
    private readonly SmartApiaryDbContext _context;

    public HiveRepository(SmartApiaryDbContext context)
    {
        _context = context;
    }

    public Task<Hive?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return _context.Hives.FirstOrDefaultAsync(hive => hive.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<Hive>> GetByApiaryIdAsync(
        Guid apiaryId,
        CancellationToken cancellationToken = default)
    {
        return await _context.Hives
            .Where(hive => hive.ApiaryId == apiaryId)
            .OrderBy(hive => hive.Label)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Hive hive, CancellationToken cancellationToken = default)
    {
        await _context.Hives.AddAsync(hive, cancellationToken);
    }

    public void Update(Hive hive)
    {
        _context.Hives.Update(hive);
    }

    public void Delete(Hive hive)
    {
        _context.Hives.Remove(hive);
    }
}
