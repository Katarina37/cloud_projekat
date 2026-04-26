using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Application.Interfaces.Services;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.Models;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Application.Features.Spraying;

public sealed class SprayingNotificationService : ISprayingNotificationService
{
    private const double NotificationRadiusKm = 5d;

    private readonly IApiaryRepository _apiaryRepository;
    private readonly INotificationRepository _notificationRepository;
    private readonly INotificationSender _notificationSender;

    public SprayingNotificationService(
        IApiaryRepository apiaryRepository,
        INotificationRepository notificationRepository,
        INotificationSender notificationSender)
    {
        _apiaryRepository = apiaryRepository;
        _notificationRepository = notificationRepository;
        _notificationSender = notificationSender;
    }

    public async Task<int> NotifyNearbyBeekeepersAsync(
        GeoLocation parcelLocation,
        string title,
        string message,
        NotificationType notificationType,
        CancellationToken cancellationToken = default)
    {
        var nearbyApiaries = await _apiaryRepository.FindWithinRadiusAsync(
            parcelLocation,
            NotificationRadiusKm,
            cancellationToken);

        var beekeeperIds = nearbyApiaries
            .Select(apiary => apiary.BeekeeperId)
            .Distinct()
            .ToList();

        foreach (var beekeeperId in beekeeperIds)
        {
            var notification = new Notification(beekeeperId, notificationType, title, message);

            await _notificationRepository.AddAsync(notification, cancellationToken);
            await _notificationSender.SendToUserAsync(beekeeperId, title, message, cancellationToken);
        }

        return beekeeperIds.Count;
    }
}
