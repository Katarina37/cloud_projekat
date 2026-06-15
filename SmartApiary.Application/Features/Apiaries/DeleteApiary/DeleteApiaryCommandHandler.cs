// Ovde brisemo pcelinjak.
// Specifikacija - pcelinjaci i mapa.

using MediatR;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Application.Interfaces.Services;

namespace SmartApiary.Application.Features.Apiaries.DeleteApiary;

public sealed class DeleteApiaryCommandHandler : IRequestHandler<DeleteApiaryCommand, Result>
{
    private readonly IApiaryRepository _apiaryRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteApiaryCommandHandler(
        ICurrentUserService currentUserService,
        IApiaryRepository apiaryRepository,
        IUnitOfWork unitOfWork)
    {
        _currentUserService = currentUserService;
        _apiaryRepository = apiaryRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(DeleteApiaryCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.IsAuthenticated || _currentUserService.UserId is not { } beekeeperId)
        {
            return Result.Failure("User is not authenticated.", ErrorType.Unauthorized);
        }

        var apiary = await _apiaryRepository.GetByIdAsync(request.ApiaryId, cancellationToken);
        if (apiary is null)
        {
            return Result.Failure("Apiary was not found.", ErrorType.NotFound);
        }

        if (apiary.BeekeeperId != beekeeperId)
        {
            return Result.Failure("Apiary does not belong to the current beekeeper.", ErrorType.Unauthorized);
        }

        _apiaryRepository.Delete(apiary);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
