// Ovde pravimo obavestenja za pcelare blizu parcele.
// Specifikacija - prskanje i digitalni karton.

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
    private readonly ISprayingAnnouncementRepository _sprayingAnnouncementRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserRepository _userRepository;

    public SprayingNotificationService(
        IApiaryRepository apiaryRepository,
        ICropRepository cropRepository,
        INotificationRepository notificationRepository,
        INotificationSender notificationSender,
        ISprayingAnnouncementRepository sprayingAnnouncementRepository,
        IUnitOfWork unitOfWork,
        IUserRepository userRepository)
    {
        _apiaryRepository = apiaryRepository;
        _cropRepository = cropRepository;
        _notificationRepository = notificationRepository;
        _notificationSender = notificationSender;
        _sprayingAnnouncementRepository = sprayingAnnouncementRepository;
        _unitOfWork = unitOfWork;
        _userRepository = userRepository;
    }

    public async Task<int> NotifyNearbyBeekeepersAsync(
        SprayingNotificationMessage notificationMessage,
        CancellationToken cancellationToken = default)
    {
        // Koordinate iz Queue poruke pretvaramo u lokaciju.
        var parcelLocation = new GeoLocation(
            notificationMessage.Latitude,
            notificationMessage.Longitude);

        var nearbyApiaries = await _apiaryRepository.FindWithinRadiusAsync(
            parcelLocation,
            NotificationRadiusKm,
            cancellationToken);

        // Jedan pcelar dobija jedno obavestenje za sve svoje ugrozene pcelinjake.
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

        // Prvo sacuvamo obavestenja.
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

        // Broj se upisuje tek kada Queue trigger stvarno napravi obavestenja.
        // Za pomeranje i otkazivanje saljemo nova obavestenja, ali ne menjamo
        // rezultat prvobitne najave prskanja.
        if (notificationMessage.NotificationType == NotificationType.PesticideWarning)
        {
            var announcement = await _sprayingAnnouncementRepository.GetByIdAsync(
                notificationMessage.AnnouncementId,
                cancellationToken);

            if (announcement is null)
            {
                throw new InvalidOperationException(
                    $"Spraying announcement '{notificationMessage.AnnouncementId}' was not found.");
            }

            announcement.RecordNotificationResult(apiariesByBeekeeper.Count);
            _sprayingAnnouncementRepository.Update(announcement);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Tek posle cuvanja ih stvarno saljemo.
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
