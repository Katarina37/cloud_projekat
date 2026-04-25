using MediatR;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Application.Interfaces.Services;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Application.Features.Apiaries.UpdateApiary;

public sealed class UpdateApiaryCommandHandler : IRequestHandler<UpdateApiaryCommand, Result>
{
    private readonly IApiaryRepository _apiaryRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateApiaryCommandHandler(
        ICurrentUserService currentUserService,
        IApiaryRepository apiaryRepository,
        IUnitOfWork unitOfWork)
    {
        _currentUserService = currentUserService;
        _apiaryRepository = apiaryRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(UpdateApiaryCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.IsAuthenticated || _currentUserService.UserId is not { } beekeeperId)
        {
            return Result.Failure("User is not authenticated.");
        }

        var apiary = await _apiaryRepository.GetByIdAsync(request.ApiaryId, cancellationToken);
        if (apiary is null)
        {
            return Result.Failure("Apiary was not found.");
        }

        if (apiary.BeekeeperId != beekeeperId)
        {
            return Result.Failure("Apiary does not belong to the current beekeeper.");
        }

        var location = new GeoLocation(request.Latitude, request.Longitude);
        apiary.UpdateDetails(request.Name, location, request.TerrainDescription);

        _apiaryRepository.Update(apiary);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
