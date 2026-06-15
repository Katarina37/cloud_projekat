// Ovde su metode koje ICropRepository repozitorijum mora da ima.

using SmartApiary.Domain.Models;

namespace SmartApiary.Application.Interfaces.Repositories;

public interface ICropRepository
{
    Task<Crop?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Crop>> GetByParcelIdAsync(Guid parcelId, CancellationToken cancellationToken = default);

    Task AddAsync(Crop crop, CancellationToken cancellationToken = default);

    void Update(Crop crop);

    void Delete(Crop crop);
}
