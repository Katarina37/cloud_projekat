// HTTP Function koja prima merenje sa uredjaja.
// Specifikacija - IoT telemetrija i X-Device-Token.
// Vezbe 2 - HTTP trigger.

using System.Net;
using System.Text.Json;
using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using SmartApiary.Application.Features.Telemetry.ReceiveTelemetry;
using SmartApiary.Functions.Extensions;

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
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "telemetry")] HttpRequestData req,
        CancellationToken cancellationToken)
    {
        // Uredjaj mora da posalje svoj token u header-u.
        if (!req.Headers.TryGetValues("X-Device-Token", out var tokenValues))
        {
            var unauthorized = req.CreateResponse(HttpStatusCode.Unauthorized);
            await unauthorized.WriteAsJsonAsync(new { message = "X-Device-Token header is required." }, cancellationToken);
            return unauthorized;
        }

        var deviceAccessToken = tokenValues.FirstOrDefault();
        if (string.IsNullOrWhiteSpace(deviceAccessToken))
        {
            var unauthorized = req.CreateResponse(HttpStatusCode.Unauthorized);
            await unauthorized.WriteAsJsonAsync(new { message = "X-Device-Token header is required." }, cancellationToken);
            return unauthorized;
        }

        // JSON iz body-ja pretvaramo u C# objekat.
        TelemetryIngestionRequest? request;
        try
        {
            request = await JsonSerializer.DeserializeAsync<TelemetryIngestionRequest>(
                req.Body,
                JsonOptions,
                cancellationToken);
        }
        catch (JsonException)
        {
            var badRequest = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequest.WriteAsJsonAsync(new { message = "Telemetry payload is invalid." }, cancellationToken);
            return badRequest;
        }

        if (request is null)
        {
            var badRequest = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequest.WriteAsJsonAsync(new { message = "Telemetry payload is required." }, cancellationToken);
            return badRequest;
        }

        // Ostatak posla radi ReceiveTelemetry handler.
        var result = await _mediator.Send(
            new ReceiveTelemetryCommand(
                deviceAccessToken.Trim(),
                request.WeightKg,
                request.HumidityPercent,
                request.TemperatureCelsius,
                request.BatteryPercent,
                request.Timestamp),
            cancellationToken);

        if (result.IsFailure)
        {
            var response = req.CreateResponse(result.ToHttpStatusCode());
            await response.WriteAsJsonAsync(new { message = result.Error?.Message }, cancellationToken);
            return response;
        }

        // 201 = novo merenje je primljeno.
        var success = req.CreateResponse(HttpStatusCode.Created);
        await success.WriteAsJsonAsync(new { message = "Telemetry ingested." }, cancellationToken);
        return success;
    }

    private sealed record TelemetryIngestionRequest(
        double WeightKg,
        double HumidityPercent,
        double TemperatureCelsius,
        double BatteryPercent,
        DateTime Timestamp);
}
