using MediatR;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.DTOs;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Application.Interfaces.Services;

namespace SmartApiary.Application.Features.Map.GetNearbyParcels;

public sealed class GetNearbyParcelsQueryHandler
    : IRequestHandler<GetNearbyParcelsQuery, Result<IReadOnlyList<MapParcelDto>>>
{
    private const double DefaultRadiusKm = 5d;

    private readonly IApiaryRepository _apiaryRepository;
    private readonly ICropRepository _cropRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IParcelRepository _parcelRepository;
    private readonly IUserRepository _userRepository;

    public GetNearbyParcelsQueryHandler(
        ICurrentUserService currentUserService,
        IApiaryRepository apiaryRepository,
        IParcelRepository parcelRepository,
        ICropRepository cropRepository,
        IUserRepository userRepository)
    {
        _currentUserService = currentUserService;
        _apiaryRepository = apiaryRepository;
        _parcelRepository = parcelRepository;
        _cropRepository = cropRepository;
        _userRepository = userRepository;
    }

    public async Task<Result<IReadOnlyList<MapParcelDto>>> Handle(
        GetNearbyParcelsQuery request,
        CancellationToken cancellationToken)
    {
        if (!_currentUserService.IsAuthenticated || _currentUserService.UserId is not { } beekeeperId)
        {
            return Result<IReadOnlyList<MapParcelDto>>.Failure("User is not authenticated.", ErrorType.Unauthorized);
        }

        var apiary = await _apiaryRepository.GetByIdAsync(request.ApiaryId, cancellationToken);
        if (apiary is null)
        {
            return Result<IReadOnlyList<MapParcelDto>>.Failure("Apiary was not found.", ErrorType.NotFound);
        }

        if (apiary.BeekeeperId != beekeeperId)
        {
            return Result<IReadOnlyList<MapParcelDto>>.Failure("Apiary does not belong to the current beekeeper.", ErrorType.Unauthorized);
        }

        var parcels = await _parcelRepository.FindWithinRadiusAsync(
            apiary.Location,
            DefaultRadiusKm,
            cancellationToken);

        var parcelDtos = new List<MapParcelDto>();

        foreach (var parcel in parcels)
        {
            var crops = await _cropRepository.GetByParcelIdAsync(parcel.Id, cancellationToken);
            var farmer = await _userRepository.GetByIdAsync(parcel.FarmerId, cancellationToken);
            var farmerName = farmer is null ? string.Empty : $"{farmer.FirstName} {farmer.LastName}".Trim();

            parcelDtos.Add(new MapParcelDto
            {
                ParcelId = parcel.Id,
                ParcelName = parcel.Name,
                Latitude = parcel.Location.Latitude,
                Longitude = parcel.Location.Longitude,
                FarmerName = farmerName,
                FarmerPhone = farmer?.PhoneNumber ?? string.Empty,
                Crops = crops.Select(crop => new MapCropDto
                {
                    CropId = crop.Id,
                    Name = crop.Name,
                    ExpectedBloomingStart = crop.ExpectedBloomingStart,
                    ExpectedBloomingEnd = crop.ExpectedBloomingEnd,
                    Area = crop.Area,
                    Notes = crop.Notes
                }).ToList()
            });
        }

        return Result<IReadOnlyList<MapParcelDto>>.Success(parcelDtos);
    }
}
