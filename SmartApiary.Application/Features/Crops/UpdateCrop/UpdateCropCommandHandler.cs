using MediatR;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Application.Interfaces.Services;

namespace SmartApiary.Application.Features.Crops.UpdateCrop;

public sealed class UpdateCropCommandHandler : IRequestHandler<UpdateCropCommand, Result>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly ICropRepository _cropRepository;
    private readonly IParcelRepository _parcelRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateCropCommandHandler(
        ICurrentUserService currentUserService,
        ICropRepository cropRepository,
        IParcelRepository parcelRepository,
        IUnitOfWork unitOfWork)
    {
        _currentUserService = currentUserService;
        _cropRepository = cropRepository;
        _parcelRepository = parcelRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(UpdateCropCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.IsAuthenticated || _currentUserService.UserId is not { } farmerId)
        {
            return Result.Failure("User is not authenticated.");
        }

        var crop = await _cropRepository.GetByIdAsync(request.CropId, cancellationToken);
        if (crop is null)
        {
            return Result.Failure("Crop was not found.");
        }

        var parcel = await _parcelRepository.GetByIdAsync(crop.ParcelId, cancellationToken);
        if (parcel is null)
        {
            return Result.Failure("Parcel was not found.");
        }

        if (parcel.FarmerId != farmerId)
        {
            return Result.Failure("Crop does not belong to the current farmer.");
        }

        crop.UpdateDetails(
            request.Name,
            request.ExpectedBloomingStart,
            request.ExpectedBloomingEnd,
            request.Area,
            request.Notes);

        _cropRepository.Update(crop);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
