// Ovde su metode koje IPasswordHasher servis mora da ima.

namespace SmartApiary.Application.Interfaces.Services;

public interface IPasswordHasher
{
    string Hash(string password);

    bool Verify(string password, string passwordHash);
}
