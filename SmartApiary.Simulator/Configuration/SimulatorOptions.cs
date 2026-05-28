using System.Diagnostics.CodeAnalysis;

namespace SmartApiary.Simulator.Configuration;

public sealed record SimulatorOptions
{
    public string ApiBaseUrl { get; init; } = "https://localhost:7035/api";

    public string DeviceAccessToken { get; init; } = string.Empty;

    public string DeviceSerialNumber { get; init; } = string.Empty;

    public string DeviceIdentifier { get; init; } = string.Empty;

    public int IntervalSeconds { get; init; } = 5;

    public bool HasDeviceAccessToken => !string.IsNullOrWhiteSpace(DeviceAccessToken);

    public bool HasActivationDetails =>
        !string.IsNullOrWhiteSpace(DeviceSerialNumber)
        && !string.IsNullOrWhiteSpace(DeviceIdentifier);

    public int NormalizedIntervalSeconds => Math.Max(1, IntervalSeconds);

    public TimeSpan Interval => TimeSpan.FromSeconds(NormalizedIntervalSeconds);

    public bool TryGetTelemetryEndpoint([NotNullWhen(true)] out Uri? endpoint)
    {
        endpoint = null;

        if (string.IsNullOrWhiteSpace(ApiBaseUrl))
        {
            return false;
        }

        var telemetryEndpoint = $"{ApiBaseUrl.TrimEnd('/')}/telemetry";
        return Uri.TryCreate(telemetryEndpoint, UriKind.Absolute, out endpoint);
    }

    public bool TryGetActivationEndpoint([NotNullWhen(true)] out Uri? endpoint)
    {
        endpoint = null;

        if (string.IsNullOrWhiteSpace(ApiBaseUrl))
        {
            return false;
        }

        var activationEndpoint = $"{ApiBaseUrl.TrimEnd('/')}/devices/activate";
        return Uri.TryCreate(activationEndpoint, UriKind.Absolute, out endpoint);
    }
}
