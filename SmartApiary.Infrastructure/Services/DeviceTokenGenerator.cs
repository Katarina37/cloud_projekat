using SmartApiary.Application.Interfaces.Services;

namespace SmartApiary.Infrastructure.Services;

public class DeviceTokenGenerator : IDeviceTokenGenerator
{
    public string GenerateToken()
    {
        return Guid.NewGuid().ToString();
    }
}
