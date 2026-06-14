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
    private readonly ICropRepository _cropRepository;
    private readonly INotificationRepository _notificationRepository;
    private readonly INotificationSender _notificationSender;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserRepository _userRepository;

    public SprayingNotificationService(
        IApiaryRepository apiaryRepository,
        ICropRepository cropRepository,
        INotificationRepository notificationRepository,
        INotificationSender notificationSender,
        IUnitOfWork unitOfWork,
        IUserRepository userRepository)
    {
        _apiaryRepository = apiaryRepository;
        _cropRepository = cropRepository;
        _notificationRepository = notificationRepository;
        _notificationSender = notificationSender;
        _unitOfWork = unitOfWork;
        _userRepository = userRepository;
    }

    public async Task<int> NotifyNearbyBeekeepersAsync(
        SprayingNotificationMessage notificationMessage,
        CancellationToken cancellationToken = default)
    {
        var parcelLocation = new GeoLocation(
            notificationMessage.Latitude,
            notificationMessage.Longitude);

        var nearbyApiaries = await _apiaryRepository.FindWithinRadiusAsync(
            parcelLocation,
            NotificationRadiusKm,
            cancellationToken);

        var apiariesByBeekeeper = nearbyApiaries
            .GroupBy(apiary => apiary.BeekeeperId)
            .ToList();

        IReadOnlyList<Crop> crops = notificationMessage.ParcelId == Guid.Empty
            ? Array.Empty<Crop>()
            : await _cropRepository.GetByParcelIdAsync(
                notificationMessage.ParcelId,
                cancellationToken);
        var farmer = notificationMessage.FarmerId == Guid.Empty
            ? null
            : await _userRepository.GetByIdAsync(
                notificationMessage.FarmerId,
                cancellationToken);

        foreach (var apiaryGroup in apiariesByBeekeeper)
        {
            var message = BuildMessage(
                notificationMessage,
                apiaryGroup,
                crops,
                farmer);
            var notification = new Notification(
                apiaryGroup.Key,
                notificationMessage.NotificationType,
                notificationMessage.Title,
                message);

            await _notificationRepository.AddAsync(notification, cancellationToken);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        foreach (var apiaryGroup in apiariesByBeekeeper)
        {
            var message = BuildMessage(
                notificationMessage,
                apiaryGroup,
                crops,
                farmer);

            await _notificationSender.SendToUserAsync(
                apiaryGroup.Key,
                notificationMessage.Title,
                message,
                cancellationToken);
        }

        return apiariesByBeekeeper.Count;
    }

    private static string BuildMessage(
        SprayingNotificationMessage notificationMessage,
        IEnumerable<Apiary> apiaries,
        IReadOnlyList<Crop> crops,
        User? farmer)
    {
        var apiaryNames = string.Join(
            ", ",
            apiaries.Select(apiary => $"'{apiary.Name}'").OrderBy(name => name));
        var cropNames = crops.Count == 0
            ? "Not specified"
            : string.Join(", ", crops.Select(crop => crop.Name).Distinct().OrderBy(name => name));
        var preparation = string.IsNullOrWhiteSpace(notificationMessage.PreparationType)
            ? "Not specified"
            : notificationMessage.PreparationType;
        var farmerName = farmer is null
            ? "Not available"
            : $"{farmer.FirstName} {farmer.LastName}".Trim();
        var farmerContact = string.IsNullOrWhiteSpace(farmer?.PhoneNumber)
            ? "Not available"
            : farmer.PhoneNumber;
        var actionMessage = notificationMessage.NotificationType == NotificationType.SprayingCancelled
            ? "The treatment is cancelled; no protective action is required for this announcement."
            : "Please take timely measures to protect the listed apiary or apiaries.";

        return $"""
            {notificationMessage.Message}
            At-risk apiary/apiaries: {apiaryNames}.
            Distance: the parcel is within 5 km of the listed apiary/apiaries.
            Parcel: {notificationMessage.ParcelName}.
            Crops: {cropNames}.
            Preparation/pesticide: {preparation}.
            Planned start: {notificationMessage.StartTime:u}.
            Duration: {notificationMessage.DurationHours} hour(s).
            Farmer: {farmerName}.
            Farmer contact: {farmerContact}.
            {actionMessage}
            """;
    }
}
