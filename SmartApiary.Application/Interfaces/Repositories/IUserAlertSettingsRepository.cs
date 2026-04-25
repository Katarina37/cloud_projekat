using SmartApiary.Domain.Models;

namespace SmartApiary.Application.Interfaces.Repositories;

public interface IUserAlertSettingsRepository
{
    Task<UserAlertSettings?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);

    Task AddAsync(UserAlertSettings settings, CancellationToken cancellationToken = default);

    void Update(UserAlertSettings settings);
}
