using SmartApiary.Domain.Models;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Application.Interfaces.Repositories;

public interface IApiaryRepository
{
    Task<Apiary?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Apiary>> GetByBeekeeperIdAsync(Guid beekeeperId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Apiary>> FindWithinRadiusAsync(GeoLocation location, double radiusKm, CancellationToken cancellationToken = default);

    Task AddAsync(Apiary apiary, CancellationToken cancellationToken = default);

    void Update(Apiary apiary);

    void Delete(Apiary apiary);
}
