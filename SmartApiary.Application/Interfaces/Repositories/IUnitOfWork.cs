// Ovde su metode koje IUnitOfWork repozitorijum mora da ima.

namespace SmartApiary.Application.Interfaces.Repositories;

public interface IUnitOfWork
{
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
