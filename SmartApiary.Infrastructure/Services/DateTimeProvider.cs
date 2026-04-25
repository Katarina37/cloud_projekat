using SmartApiary.Application.Interfaces.Services;

namespace SmartApiary.Infrastructure.Services;

public class DateTimeProvider : IDateTimeProvider
{
    public DateTime UtcNow => DateTime.UtcNow;
}
