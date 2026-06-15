// Pomocni kod za Functions: FunctionCurrentUserService.

using SmartApiary.Application.Interfaces.Services;

namespace SmartApiary.Functions.Services;

public sealed class FunctionCurrentUserService : ICurrentUserService
{
    public Guid? UserId => null;

    public string? Email => null;

    public string? Role => null;

    public bool IsAuthenticated => false;
}
