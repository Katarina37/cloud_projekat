using MediatR;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Application.Interfaces.Services;

namespace SmartApiary.Application.Features.Parcels.DeleteParcel;

public sealed class DeleteParcelCommandHandler : IRequestHandler<DeleteParcelCommand, Result>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IParcelRepository _parcelRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteParcelCommandHandler(
        ICurrentUserService currentUserService,
        IParcelRepository parcelRepository,
        IUnitOfWork unitOfWork)
    {
        _currentUserService = currentUserService;
        _parcelRepository = parcelRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(DeleteParcelCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.IsAuthenticated || _currentUserService.UserId is not { } farmerId)
        {
            return Result.Failure("User is not authenticated.");
        }

        var parcel = await _parcelRepository.GetByIdAsync(request.ParcelId, cancellationToken);
        if (parcel is null)
        {
            return Result.Failure("Parcel was not found.");
        }

        if (parcel.FarmerId != farmerId)
        {
            return Result.Failure("Parcel does not belong to the current farmer.");
        }

        _parcelRepository.Delete(parcel);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
