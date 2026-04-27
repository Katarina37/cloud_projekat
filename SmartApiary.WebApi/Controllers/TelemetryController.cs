using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartApiary.Application.Features.Telemetry.GetDailyWeightDelta;
using SmartApiary.Application.Features.Telemetry.GetLatestHiveStatus;
using SmartApiary.Application.Features.Telemetry.GetTelemetryForHive;
using SmartApiary.Application.Features.Telemetry.ReceiveTelemetry;

namespace SmartApiary.WebApi.Controllers;

public sealed class TelemetryController : BaseController
{
    public TelemetryController(IMediator mediator)
        : base(mediator)
    {
    }

    [AllowAnonymous]
    [HttpPost]
    public async Task<IActionResult> Receive(
        ReceiveTelemetryCommand command,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(command, cancellationToken);
        return HandleCreatedResult(result);
    }

    [HttpGet("{hiveId:guid}")]
    public async Task<IActionResult> GetForHive(
        Guid hiveId,
        [FromQuery] DateTime from,
        [FromQuery] DateTime to,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new GetTelemetryForHiveQuery(hiveId, from, to), cancellationToken);
        return HandleResult(result);
    }

    [HttpGet("{hiveId:guid}/latest")]
    public async Task<IActionResult> GetLatest(Guid hiveId, CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new GetLatestHiveStatusQuery(hiveId), cancellationToken);
        return HandleResult(result);
    }

    [HttpGet("{hiveId:guid}/daily-delta")]
    public async Task<IActionResult> GetDailyDelta(
        Guid hiveId,
        [FromQuery] DateTime from,
        [FromQuery] DateTime to,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new GetDailyWeightDeltaQuery(hiveId, from, to), cancellationToken);
        return HandleResult(result);
    }
}
