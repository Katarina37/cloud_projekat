// Jedan mali deo simulatora: TelemetrySender.

using System.Net.Http.Headers;
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
        string deviceAccessToken,
        CancellationToken cancellationToken)
    {
        var content = new ByteArrayContent(
            JsonSerializer.SerializeToUtf8Bytes(payload, JsonOptions));
        content.Headers.ContentType = new MediaTypeHeaderValue("application/json");

        using var request = new HttpRequestMessage(HttpMethod.Post, _telemetryEndpoint)
        {
            Content = content
        };
        request.Headers.Add("X-Device-Token", deviceAccessToken);

        using var response = await _httpClient.SendAsync(request, cancellationToken);

        var body = await response.Content.ReadAsStringAsync(cancellationToken);

        return new TelemetrySendResult(
            response.StatusCode,
            response.ReasonPhrase,
            body);
    }
}
