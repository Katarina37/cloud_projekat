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
