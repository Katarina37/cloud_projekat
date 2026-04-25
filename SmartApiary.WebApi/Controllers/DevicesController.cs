using MediatR;
using Microsoft.AspNetCore.Mvc;
using SmartApiary.Application.Features.Devices.ActivateDevice;
using SmartApiary.Application.Features.Devices.GetDeviceByHive;
using SmartApiary.Application.Features.Devices.RegisterDevice;

namespace SmartApiary.WebApi.Controllers;

public sealed class DevicesController : BaseController
{
    public DevicesController(IMediator mediator)
        : base(mediator)
    {
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(
        RegisterDeviceCommand command,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(command, cancellationToken);
        return HandleResult(result);
    }

    [HttpPost("activate")]
    public async Task<IActionResult> Activate(
        ActivateDeviceCommand command,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(command, cancellationToken);
        return HandleResult(result);
    }

    [HttpGet("by-hive/{hiveId:guid}")]
    public async Task<IActionResult> GetByHive(Guid hiveId, CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new GetDeviceByHiveQuery(hiveId), cancellationToken);
        return HandleResult(result);
    }
}
