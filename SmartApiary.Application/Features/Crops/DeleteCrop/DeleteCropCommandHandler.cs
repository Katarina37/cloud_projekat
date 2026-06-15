// Ovde brisemo kulturu.
// Specifikacija - kulture na parcelama.

using MediatR;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Application.Interfaces.Services;

namespace SmartApiary.Application.Features.Crops.DeleteCrop;

public sealed class DeleteCropCommandHandler : IRequestHandler<DeleteCropCommand, Result>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly ICropRepository _cropRepository;
    private readonly IParcelRepository _parcelRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteCropCommandHandler(
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

    public async Task<Result> Handle(DeleteCropCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.IsAuthenticated || _currentUserService.UserId is not { } farmerId)
        {
            return Result.Failure("User is not authenticated.", ErrorType.Unauthorized);
        }

        var crop = await _cropRepository.GetByIdAsync(request.CropId, cancellationToken);
        if (crop is null)
        {
            return Result.Failure("Crop was not found.", ErrorType.NotFound);
        }

        var parcel = await _parcelRepository.GetByIdAsync(crop.ParcelId, cancellationToken);
        if (parcel is null)
        {
            return Result.Failure("Parcel was not found.", ErrorType.NotFound);
        }

        if (parcel.FarmerId != farmerId)
        {
            return Result.Failure("Crop does not belong to the current farmer.", ErrorType.Unauthorized);
        }

        _cropRepository.Delete(crop);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
