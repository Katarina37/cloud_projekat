// SQL citanje i upis za Device.

using Microsoft.EntityFrameworkCore;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Models;
using SmartApiary.Infrastructure.Persistence;

namespace SmartApiary.Infrastructure.Repositories;

public class DeviceRepository : IDeviceRepository
{
    private readonly SmartApiaryDbContext _context;

    public DeviceRepository(SmartApiaryDbContext context)
    {
        _context = context;
    }

    public Task<Device?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return _context.Devices.FirstOrDefaultAsync(device => device.Id == id, cancellationToken);
    }

    public Task<Device?> GetBySerialNumberAsync(
        string serialNumber,
        CancellationToken cancellationToken = default)
    {
        return _context.Devices.FirstOrDefaultAsync(
            device => device.SerialNumber == serialNumber,
            cancellationToken);
    }

    public Task<Device?> GetByHiveIdAsync(Guid hiveId, CancellationToken cancellationToken = default)
    {
        return _context.Devices.FirstOrDefaultAsync(device => device.HiveId == hiveId, cancellationToken);
    }

    public Task<Device?> GetByAccessTokenAsync(
        string accessToken,
        CancellationToken cancellationToken = default)
    {
        return _context.Devices.FirstOrDefaultAsync(
            device => device.AccessToken == accessToken,
            cancellationToken);
    }

    public async Task AddAsync(Device device, CancellationToken cancellationToken = default)
    {
        await _context.Devices.AddAsync(device, cancellationToken);
    }

    public void Update(Device device)
    {
        _context.Devices.Update(device);
    }
}
