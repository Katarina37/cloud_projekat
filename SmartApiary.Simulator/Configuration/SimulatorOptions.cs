using System.Diagnostics.CodeAnalysis;

namespace SmartApiary.Simulator.Configuration;

public sealed record SimulatorOptions
{
    public string FunctionsBaseUrl { get; init; } = "http://localhost:7271/api";

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

        if (string.IsNullOrWhiteSpace(FunctionsBaseUrl))
        {
            return false;
        }

        var telemetryEndpoint = $"{FunctionsBaseUrl.TrimEnd('/')}/telemetry";
        return Uri.TryCreate(telemetryEndpoint, UriKind.Absolute, out endpoint);
    }

    public bool TryGetActivationEndpoint([NotNullWhen(true)] out Uri? endpoint)
    {
        endpoint = null;

        if (string.IsNullOrWhiteSpace(FunctionsBaseUrl))
        {
            return false;
        }

        var activationEndpoint = $"{FunctionsBaseUrl.TrimEnd('/')}/devices/activate";
        return Uri.TryCreate(activationEndpoint, UriKind.Absolute, out endpoint);
    }
}
