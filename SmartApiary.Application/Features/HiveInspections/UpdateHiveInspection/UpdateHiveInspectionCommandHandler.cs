// Ovde menjamo pregled kosnice.
// Specifikacija - pcelarski dnevnik.

using MediatR;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Application.Interfaces.Services;
using SmartApiary.Domain.Models;

namespace SmartApiary.Application.Features.HiveInspections.UpdateHiveInspection;

public sealed class UpdateHiveInspectionCommandHandler : IRequestHandler<UpdateHiveInspectionCommand, Result>
{
    private readonly IApiaryRepository _apiaryRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IHiveInspectionRepository _hiveInspectionRepository;
    private readonly IHiveRepository _hiveRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateHiveInspectionCommandHandler(
        ICurrentUserService currentUserService,
        IHiveRepository hiveRepository,
        IApiaryRepository apiaryRepository,
        IHiveInspectionRepository hiveInspectionRepository,
        IUnitOfWork unitOfWork)
    {
        _currentUserService = currentUserService;
        _hiveRepository = hiveRepository;
        _apiaryRepository = apiaryRepository;
        _hiveInspectionRepository = hiveInspectionRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(UpdateHiveInspectionCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.IsAuthenticated || _currentUserService.UserId is not { } beekeeperId)
        {
            return Result.Failure("User is not authenticated.", ErrorType.Unauthorized);
        }

        var record = await _hiveInspectionRepository.GetByIdAsync(request.Id, cancellationToken);
        if (record is null)
        {
            return Result.Failure("Hive inspection record was not found.", ErrorType.NotFound);
        }

        if (!await HiveBelongsToCurrentBeekeeperAsync(record.HiveId, beekeeperId, cancellationToken))
        {
            return Result.Failure("Hive inspection record does not belong to the current beekeeper.", ErrorType.Unauthorized);
        }

        if (!await HiveBelongsToCurrentBeekeeperAsync(request.HiveId, beekeeperId, cancellationToken))
        {
            return Result.Failure("Hive was not found.", ErrorType.NotFound);
        }

        record.Update(
            request.HiveId,
            request.Date,
            request.FramesWithHoney,
            request.BroodFrames,
            request.QueenPresent,
            request.BottomBoardColor,
            request.HoneyQuantityKg,
            request.Notes);

        _hiveInspectionRepository.Update(record);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }

    private async Task<bool> HiveBelongsToCurrentBeekeeperAsync(
        Guid hiveId,
        Guid beekeeperId,
        CancellationToken cancellationToken)
    {
        var hive = await _hiveRepository.GetByIdAsync(hiveId, cancellationToken);
        if (hive is null)
        {
            return false;
        }

        var apiary = await _apiaryRepository.GetByIdAsync(hive.ApiaryId, cancellationToken);

        return apiary?.BeekeeperId == beekeeperId;
    }
}
