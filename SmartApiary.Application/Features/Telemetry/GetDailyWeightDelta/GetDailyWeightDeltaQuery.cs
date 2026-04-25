using MediatR;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.DTOs;

namespace SmartApiary.Application.Features.Telemetry.GetDailyWeightDelta;

public sealed record GetDailyWeightDeltaQuery(
    Guid HiveId,
    DateTime From,
    DateTime To) : IRequest<Result<IReadOnlyList<DailyWeightDeltaDto>>>;
