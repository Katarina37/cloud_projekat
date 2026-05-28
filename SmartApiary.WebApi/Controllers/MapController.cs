using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartApiary.Application.Features.Apiaries.GetMyApiaries;
using SmartApiary.Application.Features.Map.GetNearbyParcels;

namespace SmartApiary.WebApi.Controllers;

[Authorize(Roles = "Beekeeper")]
public sealed class MapController : BaseController
{
    public MapController(IMediator mediator)
        : base(mediator)
    {
    }

    [HttpGet("apiaries/{apiaryId:guid}/nearby-parcels")]
    public async Task<IActionResult> GetNearbyParcels(Guid apiaryId, CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new GetNearbyParcelsQuery(apiaryId), cancellationToken);
        return HandleResult(result);
    }

    [HttpGet("apiaries")]
    public async Task<IActionResult> GetMyApiaries(CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new GetMyApiariesQuery(), cancellationToken);
        return HandleResult(result);
    }
}
