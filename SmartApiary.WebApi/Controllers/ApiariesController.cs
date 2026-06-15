// HTTP rute za Apiaries. Glavni posao prosledjujemo handlerima.

using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.Features.Apiaries.CreateApiary;
using SmartApiary.Application.Features.Apiaries.DeleteApiary;
using SmartApiary.Application.Features.Apiaries.GetMyApiaries;
using SmartApiary.Application.Features.Apiaries.UpdateApiary;
using System.Globalization;

namespace SmartApiary.WebApi.Controllers;

[Authorize(Roles = "Beekeeper")]
public sealed class ApiariesController : BaseController
{
    public ApiariesController(IMediator mediator)
        : base(mediator)
    {
    }

    [HttpPost]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Create(
        [FromForm] string name,
        [FromForm] string latitude,
        [FromForm] string longitude,
        [FromForm] string? terrainDescription,
        [FromForm] IFormFile? image,
        CancellationToken cancellationToken)
    {
        if (!double.TryParse(latitude, NumberStyles.Float, CultureInfo.InvariantCulture, out var parsedLatitude)
            || !double.TryParse(longitude, NumberStyles.Float, CultureInfo.InvariantCulture, out var parsedLongitude))
        {
            return HandleCreatedResult(
                Result<Guid>.Failure(
                    "Latitude and longitude must be valid numbers.",
                    ErrorType.Validation),
                nameof(GetMy));
        }

        using var imageStream = image?.OpenReadStream();
        var command = new CreateApiaryCommand(
            name, parsedLatitude, parsedLongitude, terrainDescription,
            imageStream,
            image?.FileName,
            image?.ContentType,
            image?.Length ?? 0);

        var result = await Mediator.Send(command, cancellationToken);
        return HandleCreatedResult(result, nameof(GetMy));
    }

    [HttpPut("{id:guid}")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Update(
        Guid id,
        [FromForm] string name,
        [FromForm] string latitude,
        [FromForm] string longitude,
        [FromForm] string? terrainDescription,
        [FromForm] IFormFile? image,
        CancellationToken cancellationToken)
    {
        if (!double.TryParse(latitude, NumberStyles.Float, CultureInfo.InvariantCulture, out var parsedLatitude)
            || !double.TryParse(longitude, NumberStyles.Float, CultureInfo.InvariantCulture, out var parsedLongitude))
        {
            return HandleResult(
                Result.Failure(
                    "Latitude and longitude must be valid numbers.",
                    ErrorType.Validation));
        }

        using var imageStream = image?.OpenReadStream();
        var command = new UpdateApiaryCommand(
            id,
            name,
            parsedLatitude,
            parsedLongitude,
            terrainDescription,
            imageStream,
            image?.FileName,
            image?.ContentType,
            image?.Length ?? 0);

        var result = await Mediator.Send(command, cancellationToken);
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
