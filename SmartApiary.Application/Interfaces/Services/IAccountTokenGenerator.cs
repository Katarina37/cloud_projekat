// Ovde su metode koje IAccountTokenGenerator servis mora da ima.

namespace SmartApiary.Application.Interfaces.Services;

public interface IAccountTokenGenerator
{
    string GenerateToken();
}
