using SmartApiary.Domain.Enums;

namespace SmartApiary.Domain.Models;

public class Notification
{
    public Notification(Guid userId, NotificationType type, string title, string message)
    {
        if (userId == Guid.Empty)
        {
            throw new ArgumentException("User id cannot be empty.", nameof(userId));
        }

        Id = Guid.NewGuid();
        UserId = userId;
        Type = type;
        Title = RequireNotEmpty(title, nameof(title));
        Message = RequireNotEmpty(message, nameof(message));
        IsRead = false;
        CreatedAt = DateTime.UtcNow;
    }

    public Guid Id { get; private set; }

    public Guid UserId { get; private set; }

    public NotificationType Type { get; private set; }

    public string Title { get; private set; }

    public string Message { get; private set; }

    public bool IsRead { get; private set; }

    public DateTime CreatedAt { get; private set; }

    public DateTime? ReadAt { get; private set; }

    public void MarkAsRead()
    {
        if (IsRead)
        {
            return;
        }

        IsRead = true;
        ReadAt = DateTime.UtcNow;
    }

    private static string RequireNotEmpty(string value, string parameterName)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new ArgumentException("Value cannot be empty.", parameterName);
        }

        return value;
    }
}
