using MediatR;
using Microsoft.AspNetCore.Mvc;
using SmartApiary.Application.Features.HiveInspections.CreateHiveInspection;
using SmartApiary.Application.Features.HiveInspections.DeleteHiveInspection;
using SmartApiary.Application.Features.HiveInspections.GetHiveInspectionsByHiveId;
using SmartApiary.Application.Features.HiveInspections.UpdateHiveInspection;

namespace SmartApiary.WebApi.Controllers;

[Route("api/hive-inspections")]
public sealed class HiveInspectionsController : BaseController
{
    public HiveInspectionsController(IMediator mediator)
        : base(mediator)
    {
    }

    [HttpGet("by-hive/{hiveId:guid}")]
    public async Task<IActionResult> GetByHive(Guid hiveId, CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new GetHiveInspectionsByHiveIdQuery(hiveId), cancellationToken);
        return HandleResult(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        CreateHiveInspectionCommand command,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(command, cancellationToken);
        return HandleResult(result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(
        Guid id,
        UpdateHiveInspectionCommand command,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(command with { Id = id }, cancellationToken);
        return HandleResult(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new DeleteHiveInspectionCommand(id), cancellationToken);
        return HandleResult(result);
    }
}
