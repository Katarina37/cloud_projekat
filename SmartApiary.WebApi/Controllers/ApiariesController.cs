using MediatR;
using Microsoft.AspNetCore.Mvc;
using SmartApiary.Application.Features.Apiaries.CreateApiary;
using SmartApiary.Application.Features.Apiaries.DeleteApiary;
using SmartApiary.Application.Features.Apiaries.GetMyApiaries;
using SmartApiary.Application.Features.Apiaries.UpdateApiary;

namespace SmartApiary.WebApi.Controllers;

public sealed class ApiariesController : BaseController
{
    public ApiariesController(IMediator mediator)
        : base(mediator)
    {
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        CreateApiaryCommand command,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(command, cancellationToken);
        return HandleCreatedResult(result, nameof(GetMy));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(
        Guid id,
        UpdateApiaryCommand command,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(command with { ApiaryId = id }, cancellationToken);
        return HandleResult(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new DeleteApiaryCommand(id), cancellationToken);
        return HandleDeletedResult(result);
    }

    [HttpGet]
    public async Task<IActionResult> GetMy(CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new GetMyApiariesQuery(), cancellationToken);
        return HandleResult(result);
    }
}
