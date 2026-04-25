using MediatR;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Application.Interfaces.Services;
using SmartApiary.Domain.Models;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Application.Features.Parcels.CreateParcel;

public sealed class CreateParcelCommandHandler : IRequestHandler<CreateParcelCommand, Result<Guid>>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IParcelRepository _parcelRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateParcelCommandHandler(
        ICurrentUserService currentUserService,
        IParcelRepository parcelRepository,
        IUnitOfWork unitOfWork)
    {
        _currentUserService = currentUserService;
        _parcelRepository = parcelRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Guid>> Handle(CreateParcelCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.IsAuthenticated || _currentUserService.UserId is not { } farmerId)
        {
            return Result<Guid>.Failure("User is not authenticated.");
        }

        var location = new GeoLocation(request.Latitude, request.Longitude);
        var parcel = new Parcel(farmerId, request.Name, location);

        await _parcelRepository.AddAsync(parcel, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Success(parcel.Id);
    }
}
