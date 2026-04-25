using Microsoft.EntityFrameworkCore;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Models;
using SmartApiary.Infrastructure.Persistence;

namespace SmartApiary.Infrastructure.Repositories;

public class UserAlertSettingsRepository : IUserAlertSettingsRepository
{
    private readonly SmartApiaryDbContext _context;

    public UserAlertSettingsRepository(SmartApiaryDbContext context)
    {
        _context = context;
    }

    public Task<UserAlertSettings?> GetByUserIdAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        return _context.UserAlertSettings.FirstOrDefaultAsync(
            settings => settings.UserId == userId,
            cancellationToken);
    }

    public async Task AddAsync(UserAlertSettings settings, CancellationToken cancellationToken = default)
    {
        await _context.UserAlertSettings.AddAsync(settings, cancellationToken);
    }

    public void Update(UserAlertSettings settings)
    {
        _context.UserAlertSettings.Update(settings);
    }
}
