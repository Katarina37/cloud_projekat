using MediatR;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Application.Interfaces.Services;
using SmartApiary.Domain.Enums;
using System.Text.Json;

namespace SmartApiary.Application.Features.Spraying.CompleteSpraying;

public sealed class CompleteSprayingCommandHandler : IRequestHandler<CompleteSprayingCommand, Result>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IParcelRepository _parcelRepository;
    private readonly ICropRepository _cropRepository;
    private readonly ISprayingAnnouncementRepository _sprayingAnnouncementRepository;
    private readonly IWeatherService _weatherService;
    private readonly IUnitOfWork _unitOfWork;

    public CompleteSprayingCommandHandler(
        ICurrentUserService currentUserService,
        ISprayingAnnouncementRepository sprayingAnnouncementRepository,
        IParcelRepository parcelRepository,
        ICropRepository cropRepository,
        IWeatherService weatherService,
        IUnitOfWork unitOfWork)
    {
        _currentUserService = currentUserService;
        _sprayingAnnouncementRepository = sprayingAnnouncementRepository;
        _parcelRepository = parcelRepository;
        _cropRepository = cropRepository;
        _weatherService = weatherService;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(CompleteSprayingCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.IsAuthenticated || _currentUserService.UserId is not { } farmerId)
        {
            return Result.Failure("User is not authenticated.", ErrorType.Unauthorized);
        }

        var announcement = await _sprayingAnnouncementRepository.GetByIdAsync(
            request.SprayingAnnouncementId,
            cancellationToken);

        if (announcement is null)
        {
            return Result.Failure("Spraying announcement was not found.", ErrorType.NotFound);
        }

        var parcel = await _parcelRepository.GetByIdAsync(announcement.ParcelId, cancellationToken);
        if (parcel is null)
        {
            return Result.Failure("Parcel was not found.", ErrorType.NotFound);
        }

        if (parcel.FarmerId != farmerId)
        {
            return Result.Failure("Spraying announcement does not belong to the current farmer.", ErrorType.Unauthorized);
        }

        if (announcement.Status != SprayingStatus.Scheduled)
        {
            return Result.Failure("Only a scheduled spraying announcement can be completed.", ErrorType.Conflict);
        }

        var crop = await _cropRepository.GetByIdAsync(request.CropId, cancellationToken);
        if (crop is null)
        {
            return Result.Failure("Crop was not found.", ErrorType.NotFound);
        }

        if (crop.ParcelId != parcel.Id)
        {
            return Result.Failure("Selected crop does not belong to the spraying parcel.", ErrorType.Validation);
        }

        var weatherDto = await _weatherService.GetWeatherAsync(
            parcel.Location.Latitude,
            parcel.Location.Longitude,
            request.ActualEndTime!.Value,
            cancellationToken);
        var weatherSnapshotJson = weatherDto is null
            ? "No weather data"
            : JsonSerializer.Serialize(weatherDto);

        announcement.Complete(
            request.ActualStartTime!.Value,
            request.ActualEndTime.Value,
            crop.Id,
            crop.Name,
            request.Note,
            weatherSnapshotJson);

        _sprayingAnnouncementRepository.Update(announcement);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
