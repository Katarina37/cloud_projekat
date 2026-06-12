using MediatR;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.DTOs;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Application.Interfaces.Services;
using SmartApiary.Domain.Models;

namespace SmartApiary.Application.Features.Telemetry.GetDailyWeightDelta;

public sealed class GetDailyWeightDeltaQueryHandler
    : IRequestHandler<GetDailyWeightDeltaQuery, Result<IReadOnlyList<DailyWeightDeltaDto>>>
{
    private static readonly TimeSpan MorningTargetTime = TimeSpan.FromHours(8);
    private static readonly TimeSpan EveningTargetTime = TimeSpan.FromHours(20);

    private readonly IApiaryRepository _apiaryRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IHiveRepository _hiveRepository;
    private readonly ITelemetryRepository _telemetryRepository;

    public GetDailyWeightDeltaQueryHandler(
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

        var readings = await _telemetryRepository.GetForHiveAsync(
            request.HiveId,
            request.From,
            request.To,
            cancellationToken);

        var dailyDeltas = readings
            .GroupBy(reading => reading.Timestamp.Date)
            .OrderBy(group => group.Key)
            .Select(group =>
            {
                var dayReadings = group.ToList();
                var morningReading = GetClosestReading(dayReadings, group.Key.Add(MorningTargetTime));
                var eveningReading = GetClosestReading(dayReadings, group.Key.Add(EveningTargetTime));

                return new DailyWeightDeltaDto
                {
                    Date = group.Key,
                    DeltaKg = eveningReading.WeightKg - morningReading.WeightKg
                };
            })
            .ToList();

        return Result<IReadOnlyList<DailyWeightDeltaDto>>.Success(dailyDeltas);
    }

    private static TelemetryReading GetClosestReading(
        IReadOnlyList<TelemetryReading> readings,
        DateTime targetTime)
    {
        return readings
            .OrderBy(reading => Math.Abs((reading.Timestamp - targetTime).TotalSeconds))
            .First();
    }
}
