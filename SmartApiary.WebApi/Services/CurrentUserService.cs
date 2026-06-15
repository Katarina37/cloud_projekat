// Pomocni Web API servis: CurrentUserService.

using System.Security.Claims;
using SmartApiary.Application.Interfaces.Services;

namespace SmartApiary.WebApi.Services;

public sealed class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid? UserId => GetUserId();

    public string? Email => GetClaim(ClaimTypes.Email)
        ?? GetClaim("email")
        ?? GetClaim("Email");

    public string? Role => GetClaim(ClaimTypes.Role)
        ?? GetClaim("role")
        ?? GetClaim("Role");

    public bool IsAuthenticated =>
        _httpContextAccessor.HttpContext?.User.Identity?.IsAuthenticated == true
        && UserId.HasValue;

    private Guid? GetUserId()
    {
        return ParseUserId(GetClaim(ClaimTypes.NameIdentifier))
            ?? ParseUserId(GetClaim("sub"))
            ?? ParseUserId(GetClaim("UserId"))
            ?? ParseUserId(GetClaim("userId"));
    }

    private static Guid? ParseUserId(string? value)
    {
        return Guid.TryParse(value, out var userId) && userId != Guid.Empty
            ? userId
            : null;
    }

    private string? GetClaim(string claimType)
    {
        return _httpContextAccessor.HttpContext?.User.FindFirstValue(claimType);
    }
}
