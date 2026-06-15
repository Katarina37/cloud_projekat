// Ovde su metode koje ICurrentUserService servis mora da ima.

namespace SmartApiary.Application.Interfaces.Services;

public interface ICurrentUserService
{
    Guid? UserId { get; }

    string? Email { get; }

    string? Role { get; }

    bool IsAuthenticated { get; }
}
