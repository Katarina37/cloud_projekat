using System.Net;
using System.Text.Json;
using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using SmartApiary.Application.Features.Devices.ActivateDevice;

namespace SmartApiary.Functions.DeviceActivation;

public sealed class DeviceActivationFunction
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    private readonly IMediator _mediator;

    public DeviceActivationFunction(IMediator mediator)
    {
        _mediator = mediator;
    }

    [Function("DeviceActivation")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "devices/activate")] HttpRequestData req,
        CancellationToken cancellationToken)
    {
        var request = await JsonSerializer.DeserializeAsync<DeviceActivationRequest>(
            req.Body,
            JsonOptions,
            cancellationToken);

        if (request is null || string.IsNullOrWhiteSpace(request.SerialNumber) || string.IsNullOrWhiteSpace(request.DeviceIdentifier))
        {
            var badRequest = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequest.WriteAsJsonAsync(new { message = "SerialNumber and DeviceIdentifier are required." }, cancellationToken);
            return badRequest;
        }

        var result = await _mediator.Send(
            new ActivateDeviceCommand(request.SerialNumber, request.DeviceIdentifier),
            cancellationToken);

        if (result.IsFailure)
        {
            var response = req.CreateResponse(HttpStatusCode.BadRequest);
            await response.WriteAsJsonAsync(new { message = result.Error }, cancellationToken);
            return response;
        }

        var success = req.CreateResponse(HttpStatusCode.OK);
        await success.WriteAsJsonAsync(new DeviceActivationResponse(result.Value!, result.Warning), cancellationToken);
        return success;
    }

    private sealed record DeviceActivationRequest(string SerialNumber, string DeviceIdentifier);

    private sealed record DeviceActivationResponse(string DeviceAccessToken, string? Warning);
}
