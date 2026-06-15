// Ovde ucitavamo kulture sa parcele.
// Specifikacija - kulture na parcelama.

using MediatR;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.DTOs;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Application.Interfaces.Services;

namespace SmartApiary.Application.Features.Crops.GetCropsByParcel;

public sealed class GetCropsByParcelQueryHandler
    : IRequestHandler<GetCropsByParcelQuery, Result<IReadOnlyList<CropDto>>>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly ICropRepository _cropRepository;
    private readonly IParcelRepository _parcelRepository;

    public GetCropsByParcelQueryHandler(
        ICurrentUserService currentUserService,
        ICropRepository cropRepository,
        IParcelRepository parcelRepository)
    {
        _currentUserService = currentUserService;
        _cropRepository = cropRepository;
        _parcelRepository = parcelRepository;
    }

    public async Task<Result<IReadOnlyList<CropDto>>> Handle(
        GetCropsByParcelQuery request,
        CancellationToken cancellationToken)
    {
        if (!_currentUserService.IsAuthenticated || _currentUserService.UserId is not { } farmerId)
        {
            return Result<IReadOnlyList<CropDto>>.Failure("User is not authenticated.", ErrorType.Unauthorized);
        }

        var parcel = await _parcelRepository.GetByIdAsync(request.ParcelId, cancellationToken);
        if (parcel is null)
        {
            return Result<IReadOnlyList<CropDto>>.Failure("Parcel was not found.", ErrorType.NotFound);
        }

        if (parcel.FarmerId != farmerId)
        {
            return Result<IReadOnlyList<CropDto>>.Failure("Parcel does not belong to the current farmer.", ErrorType.Unauthorized);
        }

        var crops = await _cropRepository.GetByParcelIdAsync(request.ParcelId, cancellationToken);
        var cropDtos = crops
            .Select(crop => new CropDto
            {
                Id = crop.Id,
                ParcelId = crop.ParcelId,
                Name = crop.Name,
                ExpectedBloomingStart = crop.ExpectedBloomingStart,
                ExpectedBloomingEnd = crop.ExpectedBloomingEnd,
                Area = crop.Area,
                Notes = crop.Notes
            })
            .ToList();

        return Result<IReadOnlyList<CropDto>>.Success(cropDtos);
    }
}
