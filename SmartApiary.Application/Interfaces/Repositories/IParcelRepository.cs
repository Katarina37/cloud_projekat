using SmartApiary.Domain.Models;

namespace SmartApiary.Application.Interfaces.Repositories;

public interface IParcelRepository
{
    Task<Parcel?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Parcel>> GetByFarmerIdAsync(Guid farmerId, CancellationToken cancellationToken = default);

    Task AddAsync(Parcel parcel, CancellationToken cancellationToken = default);

    void Update(Parcel parcel);

    void Delete(Parcel parcel);
}
