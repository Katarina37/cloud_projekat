using MediatR;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Application.Interfaces.Services;

namespace SmartApiary.Application.Features.Spraying.GetSprayingNotificationStatus;

public sealed class GetSprayingNotificationStatusQueryHandler
    : IRequestHandler<GetSprayingNotificationStatusQuery, Result<int>>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IParcelRepository _parcelRepository;
    private readonly ISprayingAnnouncementRepository _sprayingAnnouncementRepository;

    public GetSprayingNotificationStatusQueryHandler(
        ICurrentUserService currentUserService,
        ISprayingAnnouncementRepository sprayingAnnouncementRepository,
        IParcelRepository parcelRepository)
    {
        _currentUserService = currentUserService;
        _sprayingAnnouncementRepository = sprayingAnnouncementRepository;
        _parcelRepository = parcelRepository;
    }

    public async Task<Result<int>> Handle(
        GetSprayingNotificationStatusQuery request,
        CancellationToken cancellationToken)
    {
        if (!_currentUserService.IsAuthenticated || _currentUserService.UserId is not { } farmerId)
        {
            return Result<int>.Failure("User is not authenticated.", ErrorType.Unauthorized);
        }

        var announcement = await _sprayingAnnouncementRepository.GetByIdAsync(
            request.SprayingAnnouncementId,
            cancellationToken);
        if (announcement is null)
        {
            return Result<int>.Failure("Spraying announcement was not found.", ErrorType.NotFound);
        }

        var parcel = await _parcelRepository.GetByIdAsync(announcement.ParcelId, cancellationToken);
        if (parcel is null)
        {
            return Result<int>.Failure("Parcel was not found.", ErrorType.NotFound);
        }

        if (parcel.FarmerId != farmerId)
        {
            return Result<int>.Failure("Spraying announcement does not belong to the current farmer.", ErrorType.Unauthorized);
        }

        return Result<int>.Success(announcement.NotifiedBeekeepersCount);
    }
}
