// Ovde su metode koje INotificationSender servis mora da ima.

namespace SmartApiary.Application.Interfaces.Services;

public interface INotificationSender
{
    Task SendToUserAsync(Guid userId, string title, string message, CancellationToken cancellationToken = default);
}
