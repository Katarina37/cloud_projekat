using MediatR;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Application.Interfaces.Services;
using SmartApiary.Domain.Models;

namespace SmartApiary.Application.Features.Crops.AddCrop;

public sealed class AddCropCommandHandler : IRequestHandler<AddCropCommand, Result<Guid>>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly ICropRepository _cropRepository;
    private readonly IParcelRepository _parcelRepository;
    private readonly IUnitOfWork _unitOfWork;

    public AddCropCommandHandler(
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

    public async Task<Result<Guid>> Handle(AddCropCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.IsAuthenticated || _currentUserService.UserId is not { } farmerId)
        {
            return Result<Guid>.Failure("User is not authenticated.", ErrorType.Unauthorized);
        }

        var parcel = await _parcelRepository.GetByIdAsync(request.ParcelId, cancellationToken);
        if (parcel is null)
        {
            return Result<Guid>.Failure("Parcel was not found.", ErrorType.NotFound);
        }

        if (parcel.FarmerId != farmerId)
        {
            return Result<Guid>.Failure("Parcel does not belong to the current farmer.", ErrorType.Unauthorized);
        }

        var crop = new Crop(
            request.ParcelId,
            request.Name,
            request.ExpectedBloomingStart,
            request.ExpectedBloomingEnd,
            request.Area,
            request.Notes);

        await _cropRepository.AddAsync(crop, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Success(crop.Id);
    }
}
