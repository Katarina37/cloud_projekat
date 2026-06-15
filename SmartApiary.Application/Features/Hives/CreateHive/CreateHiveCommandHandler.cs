// Ovde dodajemo kosnicu.
// Specifikacija - kosnice.

using MediatR;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Application.Interfaces.Services;
using SmartApiary.Domain.Models;

namespace SmartApiary.Application.Features.Hives.CreateHive;

public sealed class CreateHiveCommandHandler : IRequestHandler<CreateHiveCommand, Result<Guid>>
{
    private readonly IApiaryRepository _apiaryRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IHiveRepository _hiveRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateHiveCommandHandler(
        ICurrentUserService currentUserService,
        IApiaryRepository apiaryRepository,
        IHiveRepository hiveRepository,
        IUnitOfWork unitOfWork)
    {
        _currentUserService = currentUserService;
        _apiaryRepository = apiaryRepository;
        _hiveRepository = hiveRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Guid>> Handle(CreateHiveCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.IsAuthenticated || _currentUserService.UserId is not { } beekeeperId)
        {
            return Result<Guid>.Failure("User is not authenticated.", ErrorType.Unauthorized);
        }

        var apiary = await _apiaryRepository.GetByIdAsync(request.ApiaryId, cancellationToken);
        if (apiary is null)
        {
            return Result<Guid>.Failure("Apiary was not found.", ErrorType.NotFound);
        }

        if (apiary.BeekeeperId != beekeeperId)
        {
            return Result<Guid>.Failure("Apiary does not belong to the current beekeeper.", ErrorType.Unauthorized);
        }

        var hive = new Hive(
            request.ApiaryId,
            request.Label,
            request.Type,
            request.BoxColor,
            request.QueenAgeYears,
            request.Notes);

        await _hiveRepository.AddAsync(hive, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Success(hive.Id);
    }
}
