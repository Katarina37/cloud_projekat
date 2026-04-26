using MediatR;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Application.Interfaces.Services;

namespace SmartApiary.Application.Features.HiveInspections.DeleteHiveInspection;

public sealed class DeleteHiveInspectionCommandHandler : IRequestHandler<DeleteHiveInspectionCommand, Result>
{
    private readonly IApiaryRepository _apiaryRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IHiveInspectionRepository _hiveInspectionRepository;
    private readonly IHiveRepository _hiveRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteHiveInspectionCommandHandler(
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

    public async Task<Result> Handle(DeleteHiveInspectionCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.IsAuthenticated || _currentUserService.UserId is not { } beekeeperId)
        {
            return Result.Failure("User is not authenticated.");
        }

        var record = await _hiveInspectionRepository.GetByIdAsync(request.Id, cancellationToken);
        if (record is null)
        {
            return Result.Failure("Hive inspection record was not found.");
        }

        var hive = await _hiveRepository.GetByIdAsync(record.HiveId, cancellationToken);
        if (hive is null)
        {
            return Result.Failure("Hive was not found.");
        }

        var apiary = await _apiaryRepository.GetByIdAsync(hive.ApiaryId, cancellationToken);
        if (apiary is null)
        {
            return Result.Failure("Apiary was not found.");
        }

        if (apiary.BeekeeperId != beekeeperId)
        {
            return Result.Failure("Hive inspection record does not belong to the current beekeeper.");
        }

        _hiveInspectionRepository.Delete(record);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
