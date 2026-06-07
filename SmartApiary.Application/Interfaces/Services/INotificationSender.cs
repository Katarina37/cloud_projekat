namespace SmartApiary.Application.Interfaces.Services;

public interface INotificationSender
{
    Task SendToUserAsync(Guid userId, string title, string message, CancellationToken cancellationToken = default);
}
