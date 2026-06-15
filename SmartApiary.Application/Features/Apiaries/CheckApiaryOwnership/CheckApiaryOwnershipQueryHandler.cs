// Ovde proveravamo da li pcelinjak pripada prijavljenom pcelaru.
// Specifikacija - pcelinjaci i mapa.

using MediatR;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Application.Interfaces.Services;

namespace SmartApiary.Application.Features.Apiaries.CheckApiaryOwnership;

public sealed class CheckApiaryOwnershipQueryHandler
    : IRequestHandler<CheckApiaryOwnershipQuery, Result>
{
    private readonly IApiaryRepository _apiaryRepository;
    private readonly ICurrentUserService _currentUserService;

    public CheckApiaryOwnershipQueryHandler(
        ICurrentUserService currentUserService,
        IApiaryRepository apiaryRepository)
    {
        _currentUserService = currentUserService;
        _apiaryRepository = apiaryRepository;
    }

    public async Task<Result> Handle(
        CheckApiaryOwnershipQuery request,
        CancellationToken cancellationToken)
    {
        if (!_currentUserService.IsAuthenticated
            || _currentUserService.UserId is not { } beekeeperId)
        {
            return Result.Failure(
                "User is not authenticated.",
                ErrorType.Unauthorized);
        }

        var apiary = await _apiaryRepository.GetByIdAsync(
            request.ApiaryId,
            cancellationToken);

        if (apiary is null)
        {
            return Result.Failure(
                "Apiary was not found.",
                ErrorType.NotFound);
        }

        if (apiary.BeekeeperId != beekeeperId)
        {
            return Result.Failure(
                "Apiary does not belong to the current beekeeper.",
                ErrorType.Unauthorized);
        }

        return Result.Success();
    }
}
