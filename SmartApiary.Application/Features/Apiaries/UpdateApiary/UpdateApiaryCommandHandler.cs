// Ovde menjamo pcelinjak.
// Specifikacija - pcelinjaci i mapa.

using MediatR;
using Microsoft.Extensions.Logging;
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
    private readonly IFileStorageService _fileStorageService;
    private readonly ILogger<UpdateApiaryCommandHandler> _logger;

    public UpdateApiaryCommandHandler(
        ICurrentUserService currentUserService,
        IApiaryRepository apiaryRepository,
        IUnitOfWork unitOfWork,
        IFileStorageService fileStorageService,
        ILogger<UpdateApiaryCommandHandler> logger)
    {
        _currentUserService = currentUserService;
        _apiaryRepository = apiaryRepository;
        _unitOfWork = unitOfWork;
        _fileStorageService = fileStorageService;
        _logger = logger;
    }

    public async Task<Result> Handle(UpdateApiaryCommand request, CancellationToken cancellationToken)
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

        var location = new GeoLocation(request.Latitude, request.Longitude);
        apiary.UpdateDetails(request.Name, location, request.TerrainDescription);

        var oldImageUrl = apiary.ImageUrl;
        var oldThumbnailUrl = apiary.ThumbnailUrl;
        var imageWasReplaced = false;

        if (request.ImageStream is not null &&
            !string.IsNullOrWhiteSpace(request.ImageFileName))
        {
            var uploadedImages = await _fileStorageService.UploadImageWithThumbnailAsync(
                request.ImageStream,
                request.ImageFileName,
                string.IsNullOrWhiteSpace(request.ImageContentType)
                    ? "application/octet-stream"
                    : request.ImageContentType,
                cancellationToken);

            apiary.UpdateImages(uploadedImages.ImageUrl, uploadedImages.ThumbnailUrl);
            imageWasReplaced = true;
        }

        _apiaryRepository.Update(apiary);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        if (imageWasReplaced)
        {
            await DeleteOldImageAsync(oldImageUrl, cancellationToken);
            await DeleteOldImageAsync(oldThumbnailUrl, cancellationToken);
        }

        return Result.Success();
    }

    private async Task DeleteOldImageAsync(string? fileUrl, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(fileUrl))
        {
            return;
        }

        try
        {
            await _fileStorageService.DeleteAsync(fileUrl, cancellationToken);
        }
        catch (Exception exception)
        {
            _logger.LogWarning(exception, "Failed to delete replaced apiary image {FileUrl}.", fileUrl);
        }
    }
}
