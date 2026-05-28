using System.Text.Json;

namespace SmartApiary.Simulator.Configuration;

public static class SimulatorOptionsLoader
{
    private const string SettingsFileName = "appsettings.json";

    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        ReadCommentHandling = JsonCommentHandling.Skip,
        AllowTrailingCommas = true
    };

    public static SimulatorOptions Load()
    {
        var options = LoadFromJsonFile() ?? new SimulatorOptions();
        return ApplyEnvironmentOverrides(options);
    }

    private static SimulatorOptions? LoadFromJsonFile()
    {
        var settingsPath = GetSettingsPath();

        if (!File.Exists(settingsPath))
        {
            return null;
        }

        using var stream = File.OpenRead(settingsPath);
        return JsonSerializer.Deserialize<SimulatorOptions>(stream, JsonOptions);
    }

    private static string GetSettingsPath()
    {
        var outputPath = Path.Combine(AppContext.BaseDirectory, SettingsFileName);

        if (File.Exists(outputPath))
        {
            return outputPath;
        }

        return Path.Combine(Directory.GetCurrentDirectory(), SettingsFileName);
    }

    private static SimulatorOptions ApplyEnvironmentOverrides(SimulatorOptions options)
    {
        var apiBaseUrl = Environment.GetEnvironmentVariable("SMARTAPIARY_API_BASE_URL");
        var deviceAccessToken = Environment.GetEnvironmentVariable("SMARTAPIARY_DEVICE_ACCESS_TOKEN");
        var deviceSerialNumber = Environment.GetEnvironmentVariable("SMARTAPIARY_DEVICE_SERIAL_NUMBER");
        var deviceIdentifier = Environment.GetEnvironmentVariable("SMARTAPIARY_DEVICE_IDENTIFIER");
        var intervalSeconds = Environment.GetEnvironmentVariable("SMARTAPIARY_INTERVAL_SECONDS");

        return options with
        {
            ApiBaseUrl = GetStringOverride(apiBaseUrl, options.ApiBaseUrl),
            DeviceAccessToken = GetStringOverride(deviceAccessToken, options.DeviceAccessToken),
            DeviceSerialNumber = GetStringOverride(deviceSerialNumber, options.DeviceSerialNumber),
            DeviceIdentifier = GetStringOverride(deviceIdentifier, options.DeviceIdentifier),
            IntervalSeconds = GetPositiveIntOverride(intervalSeconds, options.IntervalSeconds)
        };
    }

    private static string GetStringOverride(string? value, string fallback)
    {
        return string.IsNullOrWhiteSpace(value) ? fallback : value.Trim();
    }

    private static int GetPositiveIntOverride(string? value, int fallback)
    {
        return int.TryParse(value, out var parsedValue) && parsedValue > 0
            ? parsedValue
            : fallback;
    }
}
