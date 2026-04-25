using MediatR;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.DTOs;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Application.Interfaces.Services;

namespace SmartApiary.Application.Features.Spraying.GetSprayingByParcel;

public sealed class GetSprayingByParcelQueryHandler
    : IRequestHandler<GetSprayingByParcelQuery, Result<IReadOnlyList<SprayingAnnouncementDto>>>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IParcelRepository _parcelRepository;
    private readonly ISprayingAnnouncementRepository _sprayingAnnouncementRepository;

    public GetSprayingByParcelQueryHandler(
        ICurrentUserService currentUserService,
        IParcelRepository parcelRepository,
        ISprayingAnnouncementRepository sprayingAnnouncementRepository)
    {
        _currentUserService = currentUserService;
        _parcelRepository = parcelRepository;
        _sprayingAnnouncementRepository = sprayingAnnouncementRepository;
    }

    public async Task<Result<IReadOnlyList<SprayingAnnouncementDto>>> Handle(
        GetSprayingByParcelQuery request,
        CancellationToken cancellationToken)
    {
        if (!_currentUserService.IsAuthenticated || _currentUserService.UserId is not { } farmerId)
        {
            return Result<IReadOnlyList<SprayingAnnouncementDto>>.Failure("User is not authenticated.");
        }

        var parcel = await _parcelRepository.GetByIdAsync(request.ParcelId, cancellationToken);
        if (parcel is null)
        {
            return Result<IReadOnlyList<SprayingAnnouncementDto>>.Failure("Parcel was not found.");
        }

        if (parcel.FarmerId != farmerId)
        {
            return Result<IReadOnlyList<SprayingAnnouncementDto>>.Failure("Parcel does not belong to the current farmer.");
        }

        var announcements = await _sprayingAnnouncementRepository.GetByParcelIdAsync(
            request.ParcelId,
            cancellationToken);

        var announcementDtos = announcements
            .Select(announcement => new SprayingAnnouncementDto
            {
                Id = announcement.Id,
                ParcelId = announcement.ParcelId,
                StartTime = announcement.StartTime,
                DurationHours = announcement.DurationHours,
                PreparationType = announcement.PreparationType,
                Status = announcement.Status.ToString(),
                NotifiedBeekeepersCount = announcement.NotifiedBeekeepersCount,
                CreatedAt = announcement.CreatedAt,
                CancelledAt = announcement.CancelledAt
            })
            .ToList();

        return Result<IReadOnlyList<SprayingAnnouncementDto>>.Success(announcementDtos);
    }
}
