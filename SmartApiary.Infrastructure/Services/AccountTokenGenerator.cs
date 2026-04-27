using System.Security.Cryptography;
using SmartApiary.Application.Interfaces.Services;

namespace SmartApiary.Infrastructure.Services;

public sealed class AccountTokenGenerator : IAccountTokenGenerator
{
    public string GenerateToken()
    {
        return Convert.ToBase64String(RandomNumberGenerator.GetBytes(32))
            .Replace('+', '-')
            .Replace('/', '_')
            .TrimEnd('=');
    }
}
