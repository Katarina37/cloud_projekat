using MediatR;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Application.Interfaces.Services;

namespace SmartApiary.Application.Features.Hives.DeleteHive;

public sealed class DeleteHiveCommandHandler : IRequestHandler<DeleteHiveCommand, Result>
{
    private readonly IApiaryRepository _apiaryRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IHiveRepository _hiveRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteHiveCommandHandler(
        ICurrentUserService currentUserService,
        IHiveRepository hiveRepository,
        IApiaryRepository apiaryRepository,
        IUnitOfWork unitOfWork)
    {
        _currentUserService = currentUserService;
        _hiveRepository = hiveRepository;
        _apiaryRepository = apiaryRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(DeleteHiveCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.IsAuthenticated || _currentUserService.UserId is not { } beekeeperId)
        {
            return Result.Failure("User is not authenticated.");
        }

        var hive = await _hiveRepository.GetByIdAsync(request.HiveId, cancellationToken);
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
            return Result.Failure("Hive does not belong to the current beekeeper.");
        }

        _hiveRepository.Delete(hive);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
