using SmartApiary.Domain.Models;

namespace SmartApiary.Application.Interfaces.Repositories;

public interface IDeviceRepository
{
    Task<Device?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<Device?> GetBySerialNumberAsync(string serialNumber, CancellationToken cancellationToken = default);

    Task<Device?> GetByHiveIdAsync(Guid hiveId, CancellationToken cancellationToken = default);

    Task<Device?> GetByAccessTokenAsync(string accessToken, CancellationToken cancellationToken = default);

    Task AddAsync(Device device, CancellationToken cancellationToken = default);

    void Update(Device device);
}
