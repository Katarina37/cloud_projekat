using SmartApiary.Domain.Enums;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Application.Features.Spraying;

public interface ISprayingNotificationService
{
    Task<int> NotifyNearbyBeekeepersAsync(
        GeoLocation parcelLocation,
        string title,
        string message,
        NotificationType notificationType,
        CancellationToken cancellationToken = default);
}
