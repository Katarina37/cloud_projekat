namespace SmartApiary.Application.Interfaces.Services;

public interface INotificationSender
{
    Task SendToUserAsync(Guid userId, string title, string message, CancellationToken cancellationToken = default);

    Task SendToApiaryGroupAsync(Guid apiaryId, string eventName, object payload, CancellationToken cancellationToken = default);
}
