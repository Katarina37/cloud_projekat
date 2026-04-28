using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartApiary.Application.Features.Crops.AddCrop;
using SmartApiary.Application.Features.Crops.DeleteCrop;
using SmartApiary.Application.Features.Crops.GetCropsByParcel;
using SmartApiary.Application.Features.Crops.UpdateCrop;

namespace SmartApiary.WebApi.Controllers;

[Authorize(Roles = "Farmer")]
public sealed class CropsController : BaseController
{
    public CropsController(IMediator mediator)
        : base(mediator)
    {
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        AddCropCommand command,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(command, cancellationToken);
        return HandleCreatedResult(result, nameof(GetByParcel), new { parcelId = command.ParcelId });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(
        Guid id,
        UpdateCropCommand command,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(command with { CropId = id }, cancellationToken);
        return HandleResult(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new DeleteCropCommand(id), cancellationToken);
        return HandleDeletedResult(result);
    }

    [HttpGet("by-parcel/{parcelId:guid}")]
    public async Task<IActionResult> GetByParcel(Guid parcelId, CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new GetCropsByParcelQuery(parcelId), cancellationToken);
        return HandleResult(result);
    }
}
