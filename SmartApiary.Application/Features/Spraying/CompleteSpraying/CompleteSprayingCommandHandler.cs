using MediatR;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Application.Interfaces.Services;

namespace SmartApiary.Application.Features.Spraying.CompleteSpraying;

public sealed class CompleteSprayingCommandHandler : IRequestHandler<CompleteSprayingCommand, Result>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IParcelRepository _parcelRepository;
    private readonly ISprayingAnnouncementRepository _sprayingAnnouncementRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CompleteSprayingCommandHandler(
        ICurrentUserService currentUserService,
        ISprayingAnnouncementRepository sprayingAnnouncementRepository,
        IParcelRepository parcelRepository,
        IUnitOfWork unitOfWork)
    {
        _currentUserService = currentUserService;
        _sprayingAnnouncementRepository = sprayingAnnouncementRepository;
        _parcelRepository = parcelRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(CompleteSprayingCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.IsAuthenticated || _currentUserService.UserId is not { } farmerId)
        {
            return Result.Failure("User is not authenticated.");
        }

        var announcement = await _sprayingAnnouncementRepository.GetByIdAsync(
            request.SprayingAnnouncementId,
            cancellationToken);
        if (announcement is null)
        {
            return Result.Failure("Spraying announcement was not found.");
        }

        var parcel = await _parcelRepository.GetByIdAsync(announcement.ParcelId, cancellationToken);
        if (parcel is null)
        {
            return Result.Failure("Parcel was not found.");
        }

        if (parcel.FarmerId != farmerId)
        {
            return Result.Failure("Spraying announcement does not belong to the current farmer.");
        }

        announcement.Complete();

        _sprayingAnnouncementRepository.Update(announcement);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
