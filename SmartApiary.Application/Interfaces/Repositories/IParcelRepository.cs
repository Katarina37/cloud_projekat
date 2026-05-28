using SmartApiary.Domain.Models;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Application.Interfaces.Repositories;

public interface IParcelRepository
{
    Task<Parcel?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Parcel>> GetByFarmerIdAsync(Guid farmerId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Parcel>> FindWithinRadiusAsync(
        GeoLocation location,
        double radiusKm,
        CancellationToken cancellationToken = default);

    Task AddAsync(Parcel parcel, CancellationToken cancellationToken = default);

    void Update(Parcel parcel);

    void Delete(Parcel parcel);
}
