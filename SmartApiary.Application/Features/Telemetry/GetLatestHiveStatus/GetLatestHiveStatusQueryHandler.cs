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
    private readonly IHiveRepository _hiveRepository;
    private readonly ITelemetryRepository _telemetryRepository;

    public GetLatestHiveStatusQueryHandler(
        ICurrentUserService currentUserService,
        IHiveRepository hiveRepository,
        IApiaryRepository apiaryRepository,
        ITelemetryRepository telemetryRepository)
    {
        _currentUserService = currentUserService;
        _hiveRepository = hiveRepository;
        _apiaryRepository = apiaryRepository;
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

        var latestReading = await _telemetryRepository.GetLatestForHiveAsync(request.HiveId, cancellationToken);
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
