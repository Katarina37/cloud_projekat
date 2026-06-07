using MediatR;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Application.Interfaces.Services;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.Models;
using Microsoft.Extensions.Logging;

namespace SmartApiary.Application.Features.Telemetry.ReceiveTelemetry;

public sealed class ReceiveTelemetryCommandHandler : IRequestHandler<ReceiveTelemetryCommand, Result>
{
    private const double DefaultWeightDropThresholdKg = 10d;
    private const double LowBatteryThresholdPercent = 15d;

    private readonly IApiaryRepository _apiaryRepository;
    private readonly IDeviceRepository _deviceRepository;
    private readonly IHiveRepository _hiveRepository;
    private readonly INotificationRepository _notificationRepository;
    private readonly INotificationSender _notificationSender;
    private readonly ITelemetryRepository _telemetryRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserAlertSettingsRepository _userAlertSettingsRepository;
    private readonly ITelemetryTableService _telemetryTableService;
    private readonly ILogger<ReceiveTelemetryCommandHandler> _logger;

    public ReceiveTelemetryCommandHandler(
        IDeviceRepository deviceRepository,
        IHiveRepository hiveRepository,
        IApiaryRepository apiaryRepository,
        ITelemetryRepository telemetryRepository,
        IUserAlertSettingsRepository userAlertSettingsRepository,
        INotificationRepository notificationRepository,
        INotificationSender notificationSender,
        IUnitOfWork unitOfWork,
        ITelemetryTableService telemetryTableService,
        ILogger<ReceiveTelemetryCommandHandler> logger)
    {
        _deviceRepository = deviceRepository;
        _hiveRepository = hiveRepository;
        _apiaryRepository = apiaryRepository;
        _telemetryRepository = telemetryRepository;
        _userAlertSettingsRepository = userAlertSettingsRepository;
        _notificationRepository = notificationRepository;
        _notificationSender = notificationSender;
        _unitOfWork = unitOfWork;
        _telemetryTableService = telemetryTableService;
        _logger = logger;
    }

    public async Task<Result> Handle(ReceiveTelemetryCommand request, CancellationToken cancellationToken)
    {
        var device = await _deviceRepository.GetByAccessTokenAsync(request.DeviceAccessToken, cancellationToken);
        if (device is null)
        {
            return Result.Failure("Device access token is invalid.");
        }

        if (device.Status != DeviceStatus.Paired)
        {
            return Result.Failure("Device is not paired.");
        }

        var hive = await _hiveRepository.GetByIdAsync(device.HiveId, cancellationToken);
        if (hive is null)
        {
            return Result.Failure("Hive was not found.");
        }

        var apiary = await _apiaryRepository.GetByIdAsync(hive.ApiaryId, cancellationToken);
        if (apiary is null)
        {
            return Result.Failure("Apiary was not found.");
        }

        var previousReading = await _telemetryRepository.GetPreviousForHiveAsync(
            device.HiveId,
            request.Timestamp,
            cancellationToken);

        var reading = new TelemetryReading(
            device.HiveId,
            device.Id,
            request.Timestamp,
            request.WeightKg,
            request.HumidityPercent,
            request.TemperatureCelsius,
            request.BatteryPercent);

        await _telemetryRepository.AddAsync(reading, cancellationToken);

        await CreateWeightDropNotificationIfNeededAsync(
            apiary.BeekeeperId,
            hive.Label,
            previousReading,
            reading,
            cancellationToken);

        await CreateBatteryLowNotificationIfNeededAsync(
            apiary.BeekeeperId,
            hive.Label,
            reading,
            device,
            cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        try
        {
            await _telemetryTableService.InsertAsync(reading, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to insert telemetry reading {ReadingId} into Table Storage.", reading.Id);
        }

        return Result.Success();
    }

    private async Task CreateWeightDropNotificationIfNeededAsync(
        Guid beekeeperId,
        string hiveLabel,
        TelemetryReading? previousReading,
        TelemetryReading currentReading,
        CancellationToken cancellationToken)
    {
        if (previousReading is null)
        {
            return;
        }

        var settings = await _userAlertSettingsRepository.GetByUserIdAsync(beekeeperId, cancellationToken);
        var thresholdKg = settings?.WeightDropThresholdKg ?? DefaultWeightDropThresholdKg;
        var weightDropKg = previousReading.WeightKg - currentReading.WeightKg;

        if (weightDropKg < thresholdKg)
        {
            return;
        }

        var title = "Hive weight drop detected";
        var message = $"Hive '{hiveLabel}' weight dropped by {weightDropKg:0.##} kg.";

        await AddAndSendNotificationAsync(
            beekeeperId,
            NotificationType.WeightDrop,
            title,
            message,
            cancellationToken);
    }

    private async Task CreateBatteryLowNotificationIfNeededAsync(
        Guid beekeeperId,
        string hiveLabel,
        TelemetryReading reading,
        Device device,
        CancellationToken cancellationToken)
    {
        if (reading.BatteryPercent < LowBatteryThresholdPercent)
        {
            if (device.BatteryAlertSent)
                return;

            var title = "Device battery low";
            var message = $"Hive '{hiveLabel}' device battery is at {reading.BatteryPercent:0.##}%";
            
            device.MarkBatteryAlertSent();
            _deviceRepository.Update(device);

            await AddAndSendNotificationAsync(
            beekeeperId,
            NotificationType.BatteryLow,
            title,
            message,
            cancellationToken);
        }
        else
        {
            if (device.BatteryAlertSent)
            {
                device.ResetBatteryAlert();
                _deviceRepository.Update(device);
            }
        }
    }

    private async Task AddAndSendNotificationAsync(
        Guid beekeeperId,
        NotificationType type,
        string title,
        string message,
        CancellationToken cancellationToken)
    {
        var notification = new Notification(beekeeperId, type, title, message);

        await _notificationRepository.AddAsync(notification, cancellationToken);
        await _notificationSender.SendToUserAsync(beekeeperId, title, message, cancellationToken);
    }
}
