using MediatR;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Application.Interfaces.Services;
using SmartApiary.Domain.Models;

namespace SmartApiary.Application.Features.HiveInspections.CreateHiveInspection;

public sealed class CreateHiveInspectionCommandHandler : IRequestHandler<CreateHiveInspectionCommand, Result<Guid>>
{
    private readonly IApiaryRepository _apiaryRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IHiveInspectionRepository _hiveInspectionRepository;
    private readonly IHiveRepository _hiveRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateHiveInspectionCommandHandler(
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

    public async Task<Result<Guid>> Handle(CreateHiveInspectionCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.IsAuthenticated || _currentUserService.UserId is not { } beekeeperId)
        {
            return Result<Guid>.Failure("User is not authenticated.");
        }

        var hive = await _hiveRepository.GetByIdAsync(request.HiveId, cancellationToken);
        if (hive is null)
        {
            return Result<Guid>.Failure("Hive was not found.");
        }

        var apiary = await _apiaryRepository.GetByIdAsync(hive.ApiaryId, cancellationToken);
        if (apiary is null)
        {
            return Result<Guid>.Failure("Apiary was not found.");
        }

        if (apiary.BeekeeperId != beekeeperId)
        {
            return Result<Guid>.Failure("Hive does not belong to the current beekeeper.");
        }

        var record = new HiveInspectionRecord(
            request.HiveId,
            request.Date,
            request.FramesWithHoney,
            request.BroodFrames,
            request.QueenPresent,
            request.BottomBoardColor,
            request.HoneyQuantityKg,
            request.Notes);

        await _hiveInspectionRepository.AddAsync(record, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Success(record.Id);
    }
}
