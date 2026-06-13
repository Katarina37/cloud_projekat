using MediatR;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.DTOs;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Application.Interfaces.Services;

namespace SmartApiary.Application.Features.Telemetry.GetLatestHiveStatus;

public sealed class GetLatestHiveStatusQueryHandler
    : IRequestHandler<GetLatestHiveStatusQuery, Result<LatestHiveStatusDto>>
{
    private readonly IApiaryRepository _apiaryRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IDeviceRepository _deviceRepository;
    private readonly IHiveRepository _hiveRepository;
    private readonly ITelemetryRepository _telemetryRepository;

    public GetLatestHiveStatusQueryHandler(
        ICurrentUserService currentUserService,
        IHiveRepository hiveRepository,
        IApiaryRepository apiaryRepository,
        IDeviceRepository deviceRepository,
        ITelemetryRepository telemetryRepository)
    {
        _currentUserService = currentUserService;
        _hiveRepository = hiveRepository;
        _apiaryRepository = apiaryRepository;
        _deviceRepository = deviceRepository;
        _telemetryRepository = telemetryRepository;
    }

    public async Task<Result<LatestHiveStatusDto>> Handle(
        GetLatestHiveStatusQuery request,
        CancellationToken cancellationToken)
    {
        if (!_currentUserService.IsAuthenticated || _currentUserService.UserId is not { } beekeeperId)
        {
            return Result<LatestHiveStatusDto>.Failure("User is not authenticated.", ErrorType.Unauthorized);
        }

        var hive = await _hiveRepository.GetByIdAsync(request.HiveId, cancellationToken);
        if (hive is null)
        {
            return Result<LatestHiveStatusDto>.Failure("Hive was not found.", ErrorType.NotFound);
        }

        var apiary = await _apiaryRepository.GetByIdAsync(hive.ApiaryId, cancellationToken);
        if (apiary is null)
        {
            return Result<LatestHiveStatusDto>.Failure("Apiary was not found.", ErrorType.NotFound);
        }

        if (apiary.BeekeeperId != beekeeperId)
        {
            return Result<LatestHiveStatusDto>.Failure("Hive does not belong to the current beekeeper.", ErrorType.Unauthorized);
        }

        var device = await _deviceRepository.GetByHiveIdAsync(request.HiveId, cancellationToken);
        if (device is null)
        {
            return Result<LatestHiveStatusDto>.Failure("Telemetry reading was not found.", ErrorType.NotFound);
        }

        var latestReading = await _telemetryRepository.GetLatestAsync(device.Id, cancellationToken);
        if (latestReading is null)
        {
            return Result<LatestHiveStatusDto>.Failure("Telemetry reading was not found.", ErrorType.NotFound);
        }

        var latestHiveStatusDto = new LatestHiveStatusDto
        {
            HiveId = latestReading.HiveId,
            WeightKg = latestReading.WeightKg,
            HumidityPercent = latestReading.HumidityPercent,
            TemperatureCelsius = latestReading.TemperatureCelsius,
            BatteryPercent = latestReading.BatteryPercent,
            Timestamp = latestReading.Timestamp
        };

        return Result<LatestHiveStatusDto>.Success(latestHiveStatusDto);
    }
}
