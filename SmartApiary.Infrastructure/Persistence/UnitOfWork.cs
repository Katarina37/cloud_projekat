using SmartApiary.Application.Interfaces.Repositories;

namespace SmartApiary.Infrastructure.Persistence;

public class UnitOfWork : IUnitOfWork
{
    private readonly SmartApiaryDbContext _context;

    public UnitOfWork(SmartApiaryDbContext context)
    {
        _context = context;
    }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return _context.SaveChangesAsync(cancellationToken);
    }
}
