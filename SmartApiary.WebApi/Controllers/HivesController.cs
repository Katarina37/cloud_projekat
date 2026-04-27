using MediatR;
using Microsoft.AspNetCore.Mvc;
using SmartApiary.Application.Features.Hives.CreateHive;
using SmartApiary.Application.Features.Hives.DeleteHive;
using SmartApiary.Application.Features.Hives.GetHivesByApiary;
using SmartApiary.Application.Features.Hives.UpdateHive;

namespace SmartApiary.WebApi.Controllers;

public sealed class HivesController : BaseController
{
    public HivesController(IMediator mediator)
        : base(mediator)
    {
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        CreateHiveCommand command,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(command, cancellationToken);
        return HandleCreatedResult(result, nameof(GetByApiary), new { apiaryId = command.ApiaryId });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(
        Guid id,
        UpdateHiveCommand command,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(command with { HiveId = id }, cancellationToken);
        return HandleResult(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new DeleteHiveCommand(id), cancellationToken);
        return HandleDeletedResult(result);
    }

    [HttpGet("by-apiary/{apiaryId:guid}")]
    public async Task<IActionResult> GetByApiary(Guid apiaryId, CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new GetHivesByApiaryQuery(apiaryId), cancellationToken);
        return HandleResult(result);
    }
}
