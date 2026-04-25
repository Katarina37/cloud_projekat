using SmartApiary.Application.Interfaces.Services;

namespace SmartApiary.Infrastructure.Services;

public sealed class NoopNotificationSender : INotificationSender
{
    public Task SendToUserAsync(
        Guid userId,
        string title,
        string message,
        CancellationToken cancellationToken = default)
    {
        return Task.CompletedTask;
    }

    public Task SendToApiaryGroupAsync(
        Guid apiaryId,
        string eventName,
        object payload,
        CancellationToken cancellationToken = default)
    {
        return Task.CompletedTask;
    }
}
