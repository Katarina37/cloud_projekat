// Ovde su metode koje IUserRepository repozitorijum mora da ima.

using SmartApiary.Domain.Models;

namespace SmartApiary.Application.Interfaces.Repositories;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);

    Task<User?> GetByActivationTokenAsync(string token, CancellationToken cancellationToken = default);

    Task<User?> GetByPasswordResetTokenAsync(string token, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<User>> GetAllAsync(CancellationToken cancellationToken = default);

    Task AddAsync(User user, CancellationToken cancellationToken = default);

    void Update(User user);

    void Delete(User user);
}
