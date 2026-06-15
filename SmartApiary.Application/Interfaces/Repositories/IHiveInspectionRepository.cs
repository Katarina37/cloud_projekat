// Ovde su metode koje IHiveInspectionRepository repozitorijum mora da ima.

using SmartApiary.Domain.Models;

namespace SmartApiary.Application.Interfaces.Repositories;

public interface IHiveInspectionRepository
{
    Task<IReadOnlyList<HiveInspectionRecord>> GetByHiveIdAsync(
        Guid hiveId,
        CancellationToken cancellationToken = default);

    Task<HiveInspectionRecord?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task AddAsync(HiveInspectionRecord record, CancellationToken cancellationToken = default);

    void Update(HiveInspectionRecord record);

    void Delete(HiveInspectionRecord record);
}
