// Pomocni kod za Spraying.

using System.Globalization;
using SmartApiary.Application.DTOs;

namespace SmartApiary.Application.Features.Spraying;

internal static class SprayingWeatherWarning
{
    private const double UnsafeWindSpeedMetersPerSecond = 5;

    public static string? Build(WeatherInfoDto? weather)
    {
        if (weather is null)
        {
            return null;
        }

        var reasons = new List<string>();

        if (weather.WindSpeed > UnsafeWindSpeedMetersPerSecond)
        {
            reasons.Add($"wind speed is {weather.WindSpeed.ToString("0.#", CultureInfo.InvariantCulture)} m/s");
        }

        if (weather.HasRain)
        {
            reasons.Add("rain is expected");
        }

        if (reasons.Count == 0)
        {
            return null;
        }

        var description = string.IsNullOrWhiteSpace(weather.Description)
            ? string.Empty
            : $" Conditions: {weather.Description}.";

        return $"Weather warning: pesticide treatment conditions may be unsafe because {string.Join(" and ", reasons)}.{description}";
    }
}
