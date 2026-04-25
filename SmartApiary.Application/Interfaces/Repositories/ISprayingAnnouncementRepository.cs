using SmartApiary.Domain.Models;

namespace SmartApiary.Application.Interfaces.Repositories;

public interface ISprayingAnnouncementRepository
{
    Task<SprayingAnnouncement?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<SprayingAnnouncement>> GetByParcelIdAsync(Guid parcelId, CancellationToken cancellationToken = default);

    Task AddAsync(SprayingAnnouncement announcement, CancellationToken cancellationToken = default);

    void Update(SprayingAnnouncement announcement);
}
