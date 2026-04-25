using MediatR;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Application.Interfaces.Services;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.Models;

namespace SmartApiary.Application.Features.Spraying.CancelSpraying;

public sealed class CancelSprayingCommandHandler : IRequestHandler<CancelSprayingCommand, Result>
{
    private const double NotificationRadiusKm = 5d;

    private readonly IApiaryRepository _apiaryRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly INotificationRepository _notificationRepository;
    private readonly INotificationSender _notificationSender;
    private readonly IParcelRepository _parcelRepository;
    private readonly ISprayingAnnouncementRepository _sprayingAnnouncementRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CancelSprayingCommandHandler(
        ICurrentUserService currentUserService,
        ISprayingAnnouncementRepository sprayingAnnouncementRepository,
        IParcelRepository parcelRepository,
        IApiaryRepository apiaryRepository,
        INotificationRepository notificationRepository,
        INotificationSender notificationSender,
        IUnitOfWork unitOfWork)
    {
        _currentUserService = currentUserService;
        _sprayingAnnouncementRepository = sprayingAnnouncementRepository;
        _parcelRepository = parcelRepository;
        _apiaryRepository = apiaryRepository;
        _notificationRepository = notificationRepository;
        _notificationSender = notificationSender;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(CancelSprayingCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.IsAuthenticated || _currentUserService.UserId is not { } farmerId)
        {
            return Result.Failure("User is not authenticated.");
        }

        var announcement = await _sprayingAnnouncementRepository.GetByIdAsync(
            request.SprayingAnnouncementId,
            cancellationToken);
        if (announcement is null)
        {
            return Result.Failure("Spraying announcement was not found.");
        }

        var parcel = await _parcelRepository.GetByIdAsync(announcement.ParcelId, cancellationToken);
        if (parcel is null)
        {
            return Result.Failure("Parcel was not found.");
        }

        if (parcel.FarmerId != farmerId)
        {
            return Result.Failure("Spraying announcement does not belong to the current farmer.");
        }

        announcement.Cancel();

        var nearbyApiaries = await _apiaryRepository.FindWithinRadiusAsync(
            parcel.Location,
            NotificationRadiusKm,
            cancellationToken);

        var beekeeperIds = nearbyApiaries
            .Select(apiary => apiary.BeekeeperId)
            .Distinct()
            .ToList();

        var title = "Pesticide spraying cancelled";
        var message = $"Spraying on parcel '{parcel.Name}' scheduled for {announcement.StartTime:u} was cancelled.";

        foreach (var beekeeperId in beekeeperIds)
        {
            var notification = new Notification(beekeeperId, NotificationType.SprayingCancelled, title, message);

            await _notificationRepository.AddAsync(notification, cancellationToken);
            await _notificationSender.SendToUserAsync(beekeeperId, title, message, cancellationToken);
        }

        _sprayingAnnouncementRepository.Update(announcement);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
