// Podaci koji su potrebni kada ucitavamo telemetriju kosnice.

using MediatR;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.DTOs;

namespace SmartApiary.Application.Features.Telemetry.GetTelemetryForHive;

public sealed record GetTelemetryForHiveQuery(
    Guid HiveId,
    DateTime From,
    DateTime To) : IRequest<Result<IReadOnlyList<TelemetryReadingDto>>>;
