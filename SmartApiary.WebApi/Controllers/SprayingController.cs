using MediatR;
using Microsoft.AspNetCore.Mvc;
using SmartApiary.Application.Features.Spraying.CancelSpraying;
using SmartApiary.Application.Features.Spraying.CompleteSpraying;
using SmartApiary.Application.Features.Spraying.GetSprayingByParcel;
using SmartApiary.Application.Features.Spraying.GetSprayingNotificationStatus;
using SmartApiary.Application.Features.Spraying.RescheduleSpraying;
using SmartApiary.Application.Features.Spraying.ScheduleSpraying;

namespace SmartApiary.WebApi.Controllers;

public sealed class SprayingController : BaseController
{
    public SprayingController(IMediator mediator)
        : base(mediator)
    {
    }

    [HttpPost]
    public async Task<IActionResult> Schedule(
        ScheduleSprayingCommand command,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(command, cancellationToken);
        return HandleCreatedResult(result, nameof(GetByParcel), new { parcelId = command.ParcelId });
    }

    [HttpPut("{id:guid}/reschedule")]
    public async Task<IActionResult> Reschedule(
        Guid id,
        RescheduleSprayingCommand command,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(command with { SprayingAnnouncementId = id }, cancellationToken);
        return HandleResult(result);
    }

    [HttpPut("{id:guid}/cancel")]
    public async Task<IActionResult> Cancel(Guid id, CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new CancelSprayingCommand(id), cancellationToken);
        return HandleResult(result);
    }

    [HttpPut("{id:guid}/complete")]
    public async Task<IActionResult> Complete(Guid id, CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new CompleteSprayingCommand(id), cancellationToken);
        return HandleResult(result);
    }

    [HttpGet("by-parcel/{parcelId:guid}")]
    public async Task<IActionResult> GetByParcel(Guid parcelId, CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new GetSprayingByParcelQuery(parcelId), cancellationToken);
        return HandleResult(result);
    }

    [HttpGet("{id:guid}/notifications")]
    public async Task<IActionResult> GetNotificationStatus(Guid id, CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new GetSprayingNotificationStatusQuery(id), cancellationToken);
        return HandleResult(result);
    }
}
