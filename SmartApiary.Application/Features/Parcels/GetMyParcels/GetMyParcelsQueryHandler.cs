using MediatR;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.DTOs;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Application.Interfaces.Services;

namespace SmartApiary.Application.Features.Parcels.GetMyParcels;

public sealed class GetMyParcelsQueryHandler : IRequestHandler<GetMyParcelsQuery, Result<IReadOnlyList<ParcelDto>>>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IParcelRepository _parcelRepository;

    public GetMyParcelsQueryHandler(
        ICurrentUserService currentUserService,
        IParcelRepository parcelRepository)
    {
        _currentUserService = currentUserService;
        _parcelRepository = parcelRepository;
    }

    public async Task<Result<IReadOnlyList<ParcelDto>>> Handle(
        GetMyParcelsQuery request,
        CancellationToken cancellationToken)
    {
        if (!_currentUserService.IsAuthenticated || _currentUserService.UserId is not { } farmerId)
        {
            return Result<IReadOnlyList<ParcelDto>>.Failure("User is not authenticated.", ErrorType.Unauthorized);
        }

        var parcels = await _parcelRepository.GetByFarmerIdAsync(farmerId, cancellationToken);
        var parcelDtos = parcels
            .Select(parcel => new ParcelDto
            {
                Id = parcel.Id,
                Name = parcel.Name,
                Latitude = parcel.Location.Latitude,
                Longitude = parcel.Location.Longitude,
                CreatedAt = parcel.CreatedAt
            })
            .ToList();

        return Result<IReadOnlyList<ParcelDto>>.Success(parcelDtos);
    }
}
