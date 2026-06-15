// Ovde su metode koje IJwtTokenGenerator servis mora da ima.

using SmartApiary.Domain.Models;

namespace SmartApiary.Application.Interfaces.Services;

public interface IJwtTokenGenerator
{
    string GenerateToken(User user);
}
