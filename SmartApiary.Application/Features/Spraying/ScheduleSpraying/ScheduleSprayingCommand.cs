// Podaci koji stizu kada zakazujemo prskanje.

using MediatR;
using SmartApiary.Application.Common.Results;

namespace SmartApiary.Application.Features.Spraying.ScheduleSpraying;

public sealed record ScheduleSprayingCommand(
    Guid ParcelId,
    DateTime StartTime,
    int DurationHours,
    string? PreparationType) : IRequest<Result<Guid>>;
