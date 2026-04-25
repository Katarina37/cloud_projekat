using SmartApiary.Domain.Models;

namespace SmartApiary.Application.Interfaces.Repositories;

public interface IHiveRepository
{
    Task<Hive?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Hive>> GetByApiaryIdAsync(Guid apiaryId, CancellationToken cancellationToken = default);

    Task AddAsync(Hive hive, CancellationToken cancellationToken = default);

    void Update(Hive hive);

    void Delete(Hive hive);
}
