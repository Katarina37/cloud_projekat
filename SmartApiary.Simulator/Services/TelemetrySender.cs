using System.Net.Http.Json;
using System.Text.Json;
using SmartApiary.Simulator.Models;

namespace SmartApiary.Simulator.Services;

public sealed class TelemetrySender
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    private readonly HttpClient _httpClient;
    private readonly Uri _telemetryEndpoint;

    public TelemetrySender(HttpClient httpClient, Uri telemetryEndpoint)
    {
        _httpClient = httpClient;
        _telemetryEndpoint = telemetryEndpoint;
    }

    public async Task<TelemetrySendResult> SendAsync(
        TelemetryPayload payload,
        CancellationToken cancellationToken)
    {
        using var response = await _httpClient.PostAsJsonAsync(
            _telemetryEndpoint,
            payload,
            JsonOptions,
            cancellationToken);

        var body = await response.Content.ReadAsStringAsync(cancellationToken);

        return new TelemetrySendResult(
            response.StatusCode,
            response.ReasonPhrase,
            body);
    }
}
