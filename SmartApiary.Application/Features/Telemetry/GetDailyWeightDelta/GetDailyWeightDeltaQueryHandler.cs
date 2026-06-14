using MediatR;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.DTOs;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Application.Interfaces.Services;

namespace SmartApiary.Application.Features.Telemetry.GetDailyWeightDelta;

public sealed class GetDailyWeightDeltaQueryHandler
    : IRequestHandler<GetDailyWeightDeltaQuery, Result<IReadOnlyList<DailyWeightDeltaDto>>>
{
    private static readonly TimeSpan MorningStartTime = TimeSpan.FromHours(8);
    private static readonly TimeSpan MorningEndTime = TimeSpan.FromHours(9);
    private static readonly TimeSpan EveningStartTime = TimeSpan.FromHours(19);
    private static readonly TimeSpan EveningEndTime = TimeSpan.FromHours(20);

    private readonly IApiaryRepository _apiaryRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IDeviceRepository _deviceRepository;
    private readonly IHiveRepository _hiveRepository;
    private readonly ITelemetryRepository _telemetryRepository;

    public GetDailyWeightDeltaQueryHandler(
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

    public async Task<Result<IReadOnlyList<DailyWeightDeltaDto>>> Handle(
        GetDailyWeightDeltaQuery request,
        CancellationToken cancellationToken)
    {
        if (!_currentUserService.IsAuthenticated || _currentUserService.UserId is not { } beekeeperId)
        {
            return Result<IReadOnlyList<DailyWeightDeltaDto>>.Failure("User is not authenticated.", ErrorType.Unauthorized);
        }

        var hive = await _hiveRepository.GetByIdAsync(request.HiveId, cancellationToken);
        if (hive is null)
        {
            return Result<IReadOnlyList<DailyWeightDeltaDto>>.Failure("Hive was not found.", ErrorType.NotFound);
        }

        var apiary = await _apiaryRepository.GetByIdAsync(hive.ApiaryId, cancellationToken);
        if (apiary is null)
        {
            return Result<IReadOnlyList<DailyWeightDeltaDto>>.Failure("Apiary was not found.", ErrorType.NotFound);
        }

        if (apiary.BeekeeperId != beekeeperId)
        {
            return Result<IReadOnlyList<DailyWeightDeltaDto>>.Failure("Hive does not belong to the current beekeeper.", ErrorType.Unauthorized);
        }

        var device = await _deviceRepository.GetByHiveIdAsync(request.HiveId, cancellationToken);
        if (device is null)
        {
            return Result<IReadOnlyList<DailyWeightDeltaDto>>.Success([]);
        }

        var readings = await _telemetryRepository.GetByDeviceAsync(
            device.Id,
            request.From,
            request.To,
            cancellationToken);

        var dailyDeltas = new List<DailyWeightDeltaDto>();

        foreach (var group in readings
                     .GroupBy(reading => reading.Timestamp.Date)
                     .OrderBy(group => group.Key))
        {
            var morningReading = group
                .Where(reading =>
                    reading.Timestamp.TimeOfDay >= MorningStartTime &&
                    reading.Timestamp.TimeOfDay <= MorningEndTime)
                .OrderBy(reading => reading.Timestamp)
                .FirstOrDefault();

            var eveningReading = group
                .Where(reading =>
                    reading.Timestamp.TimeOfDay >= EveningStartTime &&
                    reading.Timestamp.TimeOfDay <= EveningEndTime)
                .OrderBy(reading => reading.Timestamp)
                .LastOrDefault();

            if (morningReading is null ||
                eveningReading is null ||
                morningReading.Id == eveningReading.Id)
            {
                continue;
            }

            dailyDeltas.Add(new DailyWeightDeltaDto
            {
                Date = group.Key,
                DeltaKg = eveningReading.WeightKg - morningReading.WeightKg
            });
        }

        return Result<IReadOnlyList<DailyWeightDeltaDto>>.Success(dailyDeltas);
    }
}
