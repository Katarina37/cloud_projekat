using MediatR;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.Features.Spraying;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Application.Interfaces.Services;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.Models;

namespace SmartApiary.Application.Features.Spraying.ScheduleSpraying;

public sealed class ScheduleSprayingCommandHandler : IRequestHandler<ScheduleSprayingCommand, Result<Guid>>
{
    private const double NotificationRadiusKm = 5d;

    private readonly ICurrentUserService _currentUserService;
    private readonly IParcelRepository _parcelRepository;
    private readonly IWeatherService _weatherService;
    private readonly ISprayingQueueService _sprayingQueueService;
    private readonly IApiaryRepository _apiaryRepository;
    private readonly ISprayingAnnouncementRepository _sprayingAnnouncementRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ScheduleSprayingCommandHandler(
        ICurrentUserService currentUserService,
        IParcelRepository parcelRepository,
        IWeatherService weatherService,
        ISprayingQueueService sprayingQueueService,
        IApiaryRepository apiaryRepository,
        ISprayingAnnouncementRepository sprayingAnnouncementRepository,
        IUnitOfWork unitOfWork)
    {
        _currentUserService = currentUserService;
        _parcelRepository = parcelRepository;
        _weatherService = weatherService;
        _sprayingQueueService = sprayingQueueService;
        _apiaryRepository = apiaryRepository;
        _sprayingAnnouncementRepository = sprayingAnnouncementRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Guid>> Handle(ScheduleSprayingCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.IsAuthenticated || _currentUserService.UserId is not { } farmerId)
        {
            return Result<Guid>.Failure("User is not authenticated.", ErrorType.Unauthorized);
        }

        var parcel = await _parcelRepository.GetByIdAsync(request.ParcelId, cancellationToken);
        if (parcel is null)
        {
            return Result<Guid>.Failure("Parcel was not found.", ErrorType.NotFound);
        }

        if (parcel.FarmerId != farmerId)
        {
            return Result<Guid>.Failure("Parcel does not belong to the current farmer.", ErrorType.Unauthorized);
        }

        var weatherWarning = await GetWeatherWarningAsync(parcel, request.StartTime, cancellationToken);

        var announcement = new SprayingAnnouncement(
            request.ParcelId,
            request.StartTime,
            request.DurationHours,
            request.PreparationType);

        var nearbyApiaries = await _apiaryRepository.FindWithinRadiusAsync(
            parcel.Location, NotificationRadiusKm, cancellationToken);
        var notifiedBeekeepersCount = nearbyApiaries.Select(a => a.BeekeeperId).Distinct().Count();

        announcement.SetNotifiedBeekeepersCount(notifiedBeekeepersCount);

        var title = "Pesticide spraying scheduled";

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
            title,
            "Warning: planned pesticide spraying may endanger nearby bee colonies.",
            NotificationType.PesticideWarning), cancellationToken);

        await _sprayingAnnouncementRepository.AddAsync(announcement, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Success(announcement.Id, weatherWarning);
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
