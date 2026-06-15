// Jedan mali deo simulatora: DeviceActivationClient.

using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;

namespace SmartApiary.Simulator.Services;

public sealed class DeviceActivationClient
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    private readonly HttpClient _httpClient;
    private readonly Uri _activationEndpoint;

    public DeviceActivationClient(HttpClient httpClient, Uri activationEndpoint)
    {
        _httpClient = httpClient;
        _activationEndpoint = activationEndpoint;
    }

    public async Task<DeviceActivationResponse?> ActivateAsync(
        string serialNumber,
        string deviceIdentifier,
        CancellationToken cancellationToken)
    {
        var payload = new
        {
            serialNumber,
            deviceIdentifier
        };

        using var content = new ByteArrayContent(
            JsonSerializer.SerializeToUtf8Bytes(payload, JsonOptions));
        content.Headers.ContentType = new MediaTypeHeaderValue("application/json");

        using var response = await _httpClient.PostAsync(
            _activationEndpoint,
            content,
            cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);
            Console.WriteLine($"Neuspesna aktivacija: {(int)response.StatusCode} {response.ReasonPhrase}");

            if (!string.IsNullOrWhiteSpace(responseBody))
            {
                Console.WriteLine(responseBody);
            }

            return null;
        }

        return await response.Content.ReadFromJsonAsync<DeviceActivationResponse>(cancellationToken);
    }
}

public sealed record DeviceActivationResponse(
    string DeviceAccessToken,
    string? Warning);
