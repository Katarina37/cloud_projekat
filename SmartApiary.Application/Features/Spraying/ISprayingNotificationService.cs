// Ovde samo kazemo sta ISprayingNotificationService servis mora da podrzi.

namespace SmartApiary.Application.Features.Spraying;

public interface ISprayingNotificationService
{
    Task<int> NotifyNearbyBeekeepersAsync(
        SprayingNotificationMessage message,
        CancellationToken cancellationToken = default);
}
