// Ovde su metode koje IDeviceTokenGenerator servis mora da ima.

namespace SmartApiary.Application.Interfaces.Services;

public interface IDeviceTokenGenerator
{
    string GenerateToken();
}
