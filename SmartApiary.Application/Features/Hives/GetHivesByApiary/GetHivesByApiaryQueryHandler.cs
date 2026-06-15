// Ovde ucitavamo kosnice iz pcelinjaka.
// Specifikacija - kosnice.

using MediatR;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.DTOs;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Application.Interfaces.Services;

namespace SmartApiary.Application.Features.Hives.GetHivesByApiary;

public sealed class GetHivesByApiaryQueryHandler
    : IRequestHandler<GetHivesByApiaryQuery, Result<IReadOnlyList<HiveDto>>>
{
    private readonly IApiaryRepository _apiaryRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IHiveRepository _hiveRepository;

    public GetHivesByApiaryQueryHandler(
        ICurrentUserService currentUserService,
        IApiaryRepository apiaryRepository,
        IHiveRepository hiveRepository)
    {
        _currentUserService = currentUserService;
        _apiaryRepository = apiaryRepository;
        _hiveRepository = hiveRepository;
    }

    public async Task<Result<IReadOnlyList<HiveDto>>> Handle(
        GetHivesByApiaryQuery request,
        CancellationToken cancellationToken)
    {
        if (!_currentUserService.IsAuthenticated || _currentUserService.UserId is not { } beekeeperId)
        {
            return Result<IReadOnlyList<HiveDto>>.Failure("User is not authenticated.", ErrorType.Unauthorized);
        }

        var apiary = await _apiaryRepository.GetByIdAsync(request.ApiaryId, cancellationToken);
        if (apiary is null)
        {
            return Result<IReadOnlyList<HiveDto>>.Failure("Apiary was not found.", ErrorType.NotFound);
        }

        if (apiary.BeekeeperId != beekeeperId)
        {
            return Result<IReadOnlyList<HiveDto>>.Failure("Apiary does not belong to the current beekeeper.", ErrorType.Unauthorized);
        }

        var hives = await _hiveRepository.GetByApiaryIdAsync(request.ApiaryId, cancellationToken);
        var hiveDtos = hives
            .Select(hive => new HiveDto
            {
                Id = hive.Id,
                ApiaryId = hive.ApiaryId,
                Label = hive.Label,
                Type = hive.Type,
                BoxColor = hive.BoxColor,
                QueenAgeYears = hive.QueenAgeYears,
                Notes = hive.Notes,
                CreatedAt = hive.CreatedAt
            })
            .ToList();

        return Result<IReadOnlyList<HiveDto>>.Success(hiveDtos);
    }
}
