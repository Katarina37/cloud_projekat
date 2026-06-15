// Ovde ucitavamo pcelinjake prijavljenog pcelara.
// Specifikacija - pcelinjaci i mapa.

using MediatR;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.DTOs;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Application.Interfaces.Services;

namespace SmartApiary.Application.Features.Apiaries.GetMyApiaries;

public sealed class GetMyApiariesQueryHandler : IRequestHandler<GetMyApiariesQuery, Result<IReadOnlyList<ApiaryDto>>>
{
    private readonly IApiaryRepository _apiaryRepository;
    private readonly ICurrentUserService _currentUserService;

    public GetMyApiariesQueryHandler(
        ICurrentUserService currentUserService,
        IApiaryRepository apiaryRepository)
    {
        _currentUserService = currentUserService;
        _apiaryRepository = apiaryRepository;
    }

    public async Task<Result<IReadOnlyList<ApiaryDto>>> Handle(
        GetMyApiariesQuery request,
        CancellationToken cancellationToken)
    {
        if (!_currentUserService.IsAuthenticated || _currentUserService.UserId is not { } beekeeperId)
        {
            return Result<IReadOnlyList<ApiaryDto>>.Failure("User is not authenticated.", ErrorType.Unauthorized);
        }

        var apiaries = await _apiaryRepository.GetByBeekeeperIdAsync(beekeeperId, cancellationToken);
        var apiaryDtos = apiaries
            .Select(apiary => new ApiaryDto
            {
                Id = apiary.Id,
                BeekeeperId = apiary.BeekeeperId,
                Name = apiary.Name,
                Latitude = apiary.Location.Latitude,
                Longitude = apiary.Location.Longitude,
                TerrainDescription = apiary.TerrainDescription,
                ImageUrl = apiary.ImageUrl,
                ThumbnailUrl = apiary.ThumbnailUrl,
                CreatedAt = apiary.CreatedAt
            })
            .ToList();

        return Result<IReadOnlyList<ApiaryDto>>.Success(apiaryDtos);
    }
}
