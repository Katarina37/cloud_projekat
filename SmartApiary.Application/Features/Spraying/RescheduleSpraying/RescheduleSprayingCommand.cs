using MediatR;
using SmartApiary.Application.Common.Results;

namespace SmartApiary.Application.Features.Spraying.RescheduleSpraying;

public sealed record RescheduleSprayingCommand(
    Guid SprayingAnnouncementId,
    DateTime NewStartTime,
    int NewDurationHours) : IRequest<Result>;
