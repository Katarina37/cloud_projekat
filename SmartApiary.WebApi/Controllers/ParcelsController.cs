// HTTP rute za Parcels. Glavni posao prosledjujemo handlerima.

using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartApiary.Application.Features.Parcels.CreateParcel;
using SmartApiary.Application.Features.Parcels.DeleteParcel;
using SmartApiary.Application.Features.Parcels.GetMyParcels;
using SmartApiary.Application.Features.Parcels.UpdateParcel;

namespace SmartApiary.WebApi.Controllers;

[Authorize(Roles = "Farmer")]
public sealed class ParcelsController : BaseController
{
    public ParcelsController(IMediator mediator)
        : base(mediator)
    {
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        CreateParcelCommand command,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(command, cancellationToken);
        return HandleCreatedResult(result, nameof(GetMy));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(
        Guid id,
        UpdateParcelCommand command,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(command with { ParcelId = id }, cancellationToken);
        return HandleResult(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new DeleteParcelCommand(id), cancellationToken);
        return HandleDeletedResult(result);
    }

    [HttpGet]
    public async Task<IActionResult> GetMy(CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new GetMyParcelsQuery(), cancellationToken);
        return HandleResult(result);
    }
}
