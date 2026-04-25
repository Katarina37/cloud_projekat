using MediatR;
using Microsoft.AspNetCore.Mvc;
using SmartApiary.Application.Features.Alerts.GetAlertSettings;
using SmartApiary.Application.Features.Alerts.UpdateAlertSettings;

namespace SmartApiary.WebApi.Controllers;

public sealed class AlertsController : BaseController
{
    public AlertsController(IMediator mediator)
        : base(mediator)
    {
    }

    [HttpPut]
    public async Task<IActionResult> Update(
        UpdateAlertSettingsCommand command,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(command, cancellationToken);
        return HandleResult(result);
    }

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new GetAlertSettingsQuery(), cancellationToken);
        return HandleResult(result);
    }
}
