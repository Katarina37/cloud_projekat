using MediatR;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Application.Interfaces.Services;
using SmartApiary.Domain.Models;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Application.Features.Apiaries.CreateApiary;

public sealed class CreateApiaryCommandHandler : IRequestHandler<CreateApiaryCommand, Result<Guid>>
{
    private readonly IApiaryRepository _apiaryRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUnitOfWork _unitOfWork;

    public CreateApiaryCommandHandler(
        ICurrentUserService currentUserService,
        IApiaryRepository apiaryRepository,
        IUnitOfWork unitOfWork)
    {
        _currentUserService = currentUserService;
        _apiaryRepository = apiaryRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Guid>> Handle(CreateApiaryCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.IsAuthenticated || _currentUserService.UserId is not { } beekeeperId)
        {
            return Result<Guid>.Failure("User is not authenticated.");
        }

        var location = new GeoLocation(request.Latitude, request.Longitude);
        var apiary = new Apiary(
            beekeeperId,
            request.Name,
            location,
            request.TerrainDescription,
            request.ImageUrl,
            request.ThumbnailUrl);

        await _apiaryRepository.AddAsync(apiary, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Success(apiary.Id);
    }
}
