// Ovde su metode koje IDateTimeProvider servis mora da ima.

namespace SmartApiary.Application.Interfaces.Services;

public interface IDateTimeProvider
{
    DateTime UtcNow { get; }
}
