using System.Security.Claims;
using SmartApiary.Application.Interfaces.Services;

namespace SmartApiary.WebApi.Services;

public sealed class CurrentUserService : ICurrentUserService
{
    private static readonly Guid DefaultUserId = Guid.Parse("11111111-1111-1111-1111-111111111111");

    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid? UserId => GetUserId();

    public string? Email => GetClaim(ClaimTypes.Email)
        ?? GetClaim("email")
        ?? GetHeaderValue("X-User-Email");

    public string? Role => GetClaim(ClaimTypes.Role)
        ?? GetClaim("role")
        ?? GetHeaderValue("X-User-Role");

    public bool IsAuthenticated =>
        _httpContextAccessor.HttpContext?.User.Identity?.IsAuthenticated == true || UserId.HasValue;

    private Guid? GetUserId()
    {
        var value = GetClaim(ClaimTypes.NameIdentifier)
            ?? GetClaim("sub")
            ?? GetClaim("userId")
            ?? GetHeaderValue("X-User-Id");

        return Guid.TryParse(value, out var userId) && userId != Guid.Empty
            ? userId
            : DefaultUserId;
    }

    private string? GetClaim(string claimType)
    {
        return _httpContextAccessor.HttpContext?.User.FindFirstValue(claimType);
    }

    private string? GetHeaderValue(string headerName)
    {
        var request = _httpContextAccessor.HttpContext?.Request;
        if (request is null || !request.Headers.TryGetValue(headerName, out var value))
        {
            return null;
        }

        return value.ToString();
    }
}
