using System.Net;
using System.Text.Json;
using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using SmartApiary.Application.Features.Telemetry.ReceiveTelemetry;

namespace SmartApiary.Functions.TelemetryIngestion;

public sealed class TelemetryIngestionFunction
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    private readonly IMediator _mediator;

    public TelemetryIngestionFunction(IMediator mediator)
    {
        _mediator = mediator;
    }

    [Function("TelemetryIngestion")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Function, "post", Route = "telemetry")] HttpRequestData req,
        CancellationToken cancellationToken)
    {
        var request = await JsonSerializer.DeserializeAsync<TelemetryIngestionRequest>(
            req.Body,
            JsonOptions,
            cancellationToken);

        if (request is null)
        {
            var badRequest = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequest.WriteAsJsonAsync(new { message = "Telemetry payload is required." }, cancellationToken);
            return badRequest;
        }

        var deviceAccessToken = request.DeviceAccessToken;
        if (string.IsNullOrWhiteSpace(deviceAccessToken) && req.Headers.TryGetValues("X-Device-Token", out var tokenValues))
        {
            deviceAccessToken = tokenValues.FirstOrDefault();
        }

        if (string.IsNullOrWhiteSpace(deviceAccessToken))
        {
            var badRequest = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequest.WriteAsJsonAsync(new { message = "Device access token is required." }, cancellationToken);
            return badRequest;
        }

        var result = await _mediator.Send(
            new ReceiveTelemetryCommand(
                deviceAccessToken,
                request.WeightKg,
                request.HumidityPercent,
                request.TemperatureCelsius,
                request.BatteryPercent,
                request.Timestamp),
            cancellationToken);

        if (result.IsFailure)
        {
            var response = req.CreateResponse(HttpStatusCode.BadRequest);
            await response.WriteAsJsonAsync(new { message = result.Error }, cancellationToken);
            return response;
        }

        var success = req.CreateResponse(HttpStatusCode.Created);
        await success.WriteAsJsonAsync(new { message = "Telemetry ingested." }, cancellationToken);
        return success;
    }

    private sealed record TelemetryIngestionRequest(
        string? DeviceAccessToken,
        double WeightKg,
        double HumidityPercent,
        double TemperatureCelsius,
        double BatteryPercent,
        DateTime Timestamp);
}
