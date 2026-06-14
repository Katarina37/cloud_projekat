using MediatR;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.Features.Spraying;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Application.Interfaces.Services;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.Models;

namespace SmartApiary.Application.Features.Spraying.RescheduleSpraying;

public sealed class RescheduleSprayingCommandHandler : IRequestHandler<RescheduleSprayingCommand, Result>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IParcelRepository _parcelRepository;
    private readonly IWeatherService _weatherService;
    private readonly ISprayingQueueService _sprayingQueueService;
    private readonly ISprayingAnnouncementRepository _sprayingAnnouncementRepository;
    private readonly IUnitOfWork _unitOfWork;

    public RescheduleSprayingCommandHandler(
        ICurrentUserService currentUserService,
        ISprayingAnnouncementRepository sprayingAnnouncementRepository,
        IParcelRepository parcelRepository,
        IWeatherService weatherService,
        ISprayingQueueService sprayingQueueService,
        IUnitOfWork unitOfWork)
    {
        _currentUserService = currentUserService;
        _sprayingAnnouncementRepository = sprayingAnnouncementRepository;
        _parcelRepository = parcelRepository;
        _weatherService = weatherService;
        _sprayingQueueService = sprayingQueueService;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(RescheduleSprayingCommand request, CancellationToken cancellationToken)
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

        var weatherWarning = await GetWeatherWarningAsync(parcel, request.NewStartTime, cancellationToken);

        announcement.Reschedule(request.NewStartTime, request.NewDurationHours);

        await _sprayingQueueService.EnqueueAsync(new SprayingNotificationMessage(
            announcement.Id,
            parcel.Id,
            parcel.FarmerId,
            parcel.Name,
            announcement.StartTime,
            announcement.DurationHours,
            announcement.PreparationType,
            parcel.Location.Latitude,
            parcel.Location.Longitude,
            "Pesticide spraying changed",
            "Warning: the planned pesticide spraying time has changed.",
            NotificationType.SprayingChanged), cancellationToken);

        _sprayingAnnouncementRepository.Update(announcement);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(weatherWarning);
    }

    private async Task<string?> GetWeatherWarningAsync(
        Parcel parcel,
        DateTime startTime,
        CancellationToken cancellationToken)
    {
        try
        {
            var weather = await _weatherService.GetWeatherAsync(
                parcel.Location.Latitude,
                parcel.Location.Longitude,
                startTime,
                cancellationToken);

            return SprayingWeatherWarning.Build(weather);
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            throw;
        }
        catch
        {
            return null;
        }
    }
}
