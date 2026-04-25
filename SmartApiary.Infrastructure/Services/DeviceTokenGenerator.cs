using System.Security.Cryptography;
using SmartApiary.Application.Interfaces.Services;

namespace SmartApiary.Infrastructure.Services;

public class DeviceTokenGenerator : IDeviceTokenGenerator
{
    private const int TokenSizeInBytes = 32;

    public string GenerateToken()
    {
        return Convert.ToHexString(RandomNumberGenerator.GetBytes(TokenSizeInBytes));
    }
}
