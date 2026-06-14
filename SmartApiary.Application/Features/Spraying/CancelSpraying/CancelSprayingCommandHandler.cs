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
    private readonly ISprayingQueueService _sprayingQueueService;
    private readonly ISprayingAnnouncementRepository _sprayingAnnouncementRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CancelSprayingCommandHandler(
        ICurrentUserService currentUserService,
        ISprayingAnnouncementRepository sprayingAnnouncementRepository,
        IParcelRepository parcelRepository,
        ISprayingQueueService sprayingQueueService,
        IUnitOfWork unitOfWork)
    {
        _currentUserService = currentUserService;
        _sprayingAnnouncementRepository = sprayingAnnouncementRepository;
        _parcelRepository = parcelRepository;
        _sprayingQueueService = sprayingQueueService;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(CancelSprayingCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.IsAuthenticated || _currentUserService.UserId is not { } farmerId)
        {
            return Result.Failure("User is not authenticated.", ErrorType.Unauthorized);
        }

        var announcement = await _sprayingAnnouncementRepository.GetByIdAsync(
            request.SprayingAnnouncementId,
            cancellationToken);
        if (announcement is null)
        {
            return Result.Failure("Spraying announcement was not found.", ErrorType.NotFound);
        }

        var parcel = await _parcelRepository.GetByIdAsync(announcement.ParcelId, cancellationToken);
        if (parcel is null)
        {
            return Result.Failure("Parcel was not found.", ErrorType.NotFound);
        }

        if (parcel.FarmerId != farmerId)
        {
            return Result.Failure("Spraying announcement does not belong to the current farmer.", ErrorType.Unauthorized);
        }

        announcement.Cancel();

        await _sprayingQueueService.EnqueueAsync(new SprayingNotificationMessage(
            announcement.Id,
            parcel.Id,
            parcel.FarmerId,
            parcel.Name,
            announcement.StartTime,
            announcement.DurationHours,
            announcement.PreparationType,
            parcel.Location.Latitude,
            parcel.Location.Longitude,
            "Pesticide spraying cancelled",
            "The previously announced pesticide spraying has been cancelled.",
            NotificationType.SprayingCancelled), cancellationToken);

        _sprayingAnnouncementRepository.Update(announcement);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
