// Ovde ucitavamo telemetriju kosnice.
// Specifikacija - IoT telemetrija.

using MediatR;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.DTOs;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Application.Interfaces.Services;

namespace SmartApiary.Application.Features.Telemetry.GetTelemetryForHive;

public sealed class GetTelemetryForHiveQueryHandler
    : IRequestHandler<GetTelemetryForHiveQuery, Result<IReadOnlyList<TelemetryReadingDto>>>
{
    private readonly IApiaryRepository _apiaryRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IDeviceRepository _deviceRepository;
    private readonly IHiveRepository _hiveRepository;
    private readonly ITelemetryRepository _telemetryRepository;

    public GetTelemetryForHiveQueryHandler(
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

    public async Task<Result<IReadOnlyList<TelemetryReadingDto>>> Handle(
        GetTelemetryForHiveQuery request,
        CancellationToken cancellationToken)
    {
        if (!_currentUserService.IsAuthenticated || _currentUserService.UserId is not { } beekeeperId)
        {
            return Result<IReadOnlyList<TelemetryReadingDto>>.Failure("User is not authenticated.", ErrorType.Unauthorized);
        }

        var hive = await _hiveRepository.GetByIdAsync(request.HiveId, cancellationToken);
        if (hive is null)
        {
            return Result<IReadOnlyList<TelemetryReadingDto>>.Failure("Hive was not found.", ErrorType.NotFound);
        }

        var apiary = await _apiaryRepository.GetByIdAsync(hive.ApiaryId, cancellationToken);
        if (apiary is null)
        {
            return Result<IReadOnlyList<TelemetryReadingDto>>.Failure("Apiary was not found.", ErrorType.NotFound);
        }

        if (apiary.BeekeeperId != beekeeperId)
        {
            return Result<IReadOnlyList<TelemetryReadingDto>>.Failure("Hive does not belong to the current beekeeper.", ErrorType.Unauthorized);
        }

        var device = await _deviceRepository.GetByHiveIdAsync(request.HiveId, cancellationToken);
        if (device is null)
        {
            return Result<IReadOnlyList<TelemetryReadingDto>>.Success([]);
        }

        var readings = await _telemetryRepository.GetByDeviceAsync(
            device.Id,
            request.From,
            request.To,
            cancellationToken);

        var readingDtos = readings
            .Select(reading => new TelemetryReadingDto
            {
                Id = reading.Id,
                HiveId = reading.HiveId,
                DeviceId = reading.DeviceId,
                Timestamp = reading.Timestamp,
                WeightKg = reading.WeightKg,
                HumidityPercent = reading.HumidityPercent,
                TemperatureCelsius = reading.TemperatureCelsius,
                BatteryPercent = reading.BatteryPercent
            })
            .ToList();

        return Result<IReadOnlyList<TelemetryReadingDto>>.Success(readingDtos);
    }
}
