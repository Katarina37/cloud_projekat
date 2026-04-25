using MediatR;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Application.Interfaces.Services;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.Models;

namespace SmartApiary.Application.Features.Spraying.ScheduleSpraying;

public sealed class ScheduleSprayingCommandHandler : IRequestHandler<ScheduleSprayingCommand, Result<Guid>>
{
    private const double NotificationRadiusKm = 5d;

    private readonly IApiaryRepository _apiaryRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly INotificationRepository _notificationRepository;
    private readonly INotificationSender _notificationSender;
    private readonly IParcelRepository _parcelRepository;
    private readonly ISprayingAnnouncementRepository _sprayingAnnouncementRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ScheduleSprayingCommandHandler(
        ICurrentUserService currentUserService,
        IParcelRepository parcelRepository,
        IApiaryRepository apiaryRepository,
        INotificationRepository notificationRepository,
        INotificationSender notificationSender,
        ISprayingAnnouncementRepository sprayingAnnouncementRepository,
        IUnitOfWork unitOfWork)
    {
        _currentUserService = currentUserService;
        _parcelRepository = parcelRepository;
        _apiaryRepository = apiaryRepository;
        _notificationRepository = notificationRepository;
        _notificationSender = notificationSender;
        _sprayingAnnouncementRepository = sprayingAnnouncementRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Guid>> Handle(ScheduleSprayingCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.IsAuthenticated || _currentUserService.UserId is not { } farmerId)
        {
            return Result<Guid>.Failure("User is not authenticated.");
        }

        var parcel = await _parcelRepository.GetByIdAsync(request.ParcelId, cancellationToken);
        if (parcel is null)
        {
            return Result<Guid>.Failure("Parcel was not found.");
        }

        if (parcel.FarmerId != farmerId)
        {
            return Result<Guid>.Failure("Parcel does not belong to the current farmer.");
        }

        var announcement = new SprayingAnnouncement(
            request.ParcelId,
            request.StartTime,
            request.DurationHours,
            request.PreparationType);

        var nearbyApiaries = await _apiaryRepository.FindWithinRadiusAsync(
            parcel.Location,
            NotificationRadiusKm,
            cancellationToken);

        var beekeeperIds = nearbyApiaries
            .Select(apiary => apiary.BeekeeperId)
            .Distinct()
            .ToList();

        var title = "Pesticide spraying scheduled";
        var message = BuildScheduledMessage(parcel.Name, announcement.StartTime, announcement.DurationHours, announcement.PreparationType);

        foreach (var beekeeperId in beekeeperIds)
        {
            var notification = new Notification(beekeeperId, NotificationType.PesticideWarning, title, message);

            await _notificationRepository.AddAsync(notification, cancellationToken);
            await _notificationSender.SendToUserAsync(beekeeperId, title, message, cancellationToken);
        }

        announcement.SetNotifiedBeekeepersCount(beekeeperIds.Count);

        await _sprayingAnnouncementRepository.AddAsync(announcement, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Success(announcement.Id);
    }

    private static string BuildScheduledMessage(
        string parcelName,
        DateTime startTime,
        int durationHours,
        string? preparationType)
    {
        var preparation = string.IsNullOrWhiteSpace(preparationType)
            ? "Not specified"
            : preparationType;

        return $"Spraying on parcel '{parcelName}' is scheduled for {startTime:u} and will last {durationHours} hour(s). Preparation: {preparation}.";
    }
}
