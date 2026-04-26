using MediatR;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.Features.Spraying;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Application.Interfaces.Services;
using SmartApiary.Domain.Enums;

namespace SmartApiary.Application.Features.Spraying.CancelSpraying;

public sealed class CancelSprayingCommandHandler : IRequestHandler<CancelSprayingCommand, Result>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IParcelRepository _parcelRepository;
    private readonly ISprayingNotificationService _sprayingNotificationService;
    private readonly ISprayingAnnouncementRepository _sprayingAnnouncementRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CancelSprayingCommandHandler(
        ICurrentUserService currentUserService,
        ISprayingAnnouncementRepository sprayingAnnouncementRepository,
        IParcelRepository parcelRepository,
        ISprayingNotificationService sprayingNotificationService,
        IUnitOfWork unitOfWork)
    {
        _currentUserService = currentUserService;
        _sprayingAnnouncementRepository = sprayingAnnouncementRepository;
        _parcelRepository = parcelRepository;
        _sprayingNotificationService = sprayingNotificationService;
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

        var title = "Pesticide spraying cancelled";
        var message = $"Spraying on parcel '{parcel.Name}' scheduled for {announcement.StartTime:u} was cancelled.";
        await _sprayingNotificationService.NotifyNearbyBeekeepersAsync(
            parcel.Location,
            title,
            message,
            NotificationType.SprayingCancelled,
            cancellationToken);

        _sprayingAnnouncementRepository.Update(announcement);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
