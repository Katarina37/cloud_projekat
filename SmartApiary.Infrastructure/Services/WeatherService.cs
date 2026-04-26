using System.Globalization;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Configuration;
using SmartApiary.Application.DTOs;
using SmartApiary.Application.Interfaces.Services;

namespace SmartApiary.Infrastructure.Services;

public sealed class WeatherService : IWeatherService
{
    private const string ApiKeyConfigurationKey = "OpenWeather:ApiKey";
    private static readonly TimeSpan ForecastTolerance = TimeSpan.FromHours(3);

    private readonly HttpClient _httpClient;
    private readonly string? _apiKey;

    public WeatherService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _apiKey = configuration[ApiKeyConfigurationKey];
    }

    public async Task<WeatherInfoDto?> GetWeatherAsync(
        double latitude,
        double longitude,
        DateTime dateTime,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_apiKey))
        {
            return CreateMockWeather();
        }

        try
        {
            var forecast = await _httpClient.GetFromJsonAsync<OpenWeatherForecastResponse>(
                BuildForecastUrl(latitude, longitude, _apiKey.Trim()),
                cancellationToken);

            var forecastItem = SelectClosestForecast(forecast, dateTime);

            return forecastItem is null
                ? CreateMockWeather()
                : MapWeather(forecastItem);
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            throw;
        }
        catch (OperationCanceledException)
        {
            return CreateMockWeather();
        }
        catch (HttpRequestException)
        {
            return CreateMockWeather();
        }
        catch (JsonException)
        {
            return CreateMockWeather();
        }
        catch (NotSupportedException)
        {
            return CreateMockWeather();
        }
    }

    private static string BuildForecastUrl(double latitude, double longitude, string apiKey)
    {
        return string.Create(
            CultureInfo.InvariantCulture,
            $"data/2.5/forecast?lat={latitude}&lon={longitude}&appid={Uri.EscapeDataString(apiKey)}&units=metric");
    }

    private static OpenWeatherForecastItem? SelectClosestForecast(
        OpenWeatherForecastResponse? forecast,
        DateTime requestedDateTime)
    {
        if (forecast?.Items is null || forecast.Items.Count == 0)
        {
            return null;
        }

        var timezoneOffsetSeconds = forecast.City?.TimezoneOffsetSeconds ?? 0;
        var requestedLocalTime = ToLocationLocalTime(requestedDateTime, timezoneOffsetSeconds);
        var closest = forecast.Items
            .Select(item => new
            {
                Item = item,
                Difference = (GetForecastLocationLocalTime(item, timezoneOffsetSeconds) - requestedLocalTime).Duration(),
            })
            .OrderBy(item => item.Difference)
            .FirstOrDefault();

        return closest is not null && closest.Difference <= ForecastTolerance
            ? closest.Item
            : null;
    }

    private static DateTime ToLocationLocalTime(DateTime dateTime, int timezoneOffsetSeconds)
    {
        if (dateTime.Kind == DateTimeKind.Unspecified)
        {
            return dateTime;
        }

        var timezoneOffset = TimeSpan.FromSeconds(timezoneOffsetSeconds);
        return new DateTimeOffset(dateTime).ToOffset(timezoneOffset).DateTime;
    }

    private static DateTime GetForecastLocationLocalTime(
        OpenWeatherForecastItem forecastItem,
        int timezoneOffsetSeconds)
    {
        return DateTimeOffset
            .FromUnixTimeSeconds(forecastItem.UnixTime)
            .ToOffset(TimeSpan.FromSeconds(timezoneOffsetSeconds))
            .DateTime;
    }

    private static WeatherInfoDto MapWeather(OpenWeatherForecastItem forecastItem)
    {
        return new WeatherInfoDto
        {
            WindSpeed = forecastItem.Wind?.Speed ?? 0,
            HasRain = HasRain(forecastItem),
            Description = GetDescription(forecastItem),
        };
    }

    private static bool HasRain(OpenWeatherForecastItem forecastItem)
    {
        return forecastItem.Rain?.LastThreeHours > 0
            || forecastItem.Conditions?.Any(IsRainCondition) == true;
    }

    private static bool IsRainCondition(OpenWeatherCondition condition)
    {
        return IsRainText(condition.Main) || IsRainText(condition.Description);
    }

    private static bool IsRainText(string? value)
    {
        return value is not null
            && (value.Contains("rain", StringComparison.OrdinalIgnoreCase)
                || value.Contains("drizzle", StringComparison.OrdinalIgnoreCase)
                || value.Contains("thunderstorm", StringComparison.OrdinalIgnoreCase));
    }

    private static string? GetDescription(OpenWeatherForecastItem forecastItem)
    {
        return forecastItem.Conditions?
            .Select(condition => condition.Description ?? condition.Main)
            .FirstOrDefault(description => !string.IsNullOrWhiteSpace(description));
    }

    private static WeatherInfoDto CreateMockWeather()
    {
        return new WeatherInfoDto
        {
            WindSpeed = 0,
            HasRain = false,
            Description = "Mock weather data.",
        };
    }

    private sealed class OpenWeatherForecastResponse
    {
        [JsonPropertyName("list")]
        public List<OpenWeatherForecastItem>? Items { get; init; }

        [JsonPropertyName("city")]
        public OpenWeatherCity? City { get; init; }
    }

    private sealed class OpenWeatherCity
    {
        [JsonPropertyName("timezone")]
        public int TimezoneOffsetSeconds { get; init; }
    }

    private sealed class OpenWeatherForecastItem
    {
        [JsonPropertyName("dt")]
        public long UnixTime { get; init; }

        [JsonPropertyName("weather")]
        public List<OpenWeatherCondition>? Conditions { get; init; }

        [JsonPropertyName("wind")]
        public OpenWeatherWind? Wind { get; init; }

        [JsonPropertyName("rain")]
        public OpenWeatherRain? Rain { get; init; }
    }

    private sealed class OpenWeatherCondition
    {
        [JsonPropertyName("main")]
        public string? Main { get; init; }

        [JsonPropertyName("description")]
        public string? Description { get; init; }
    }

    private sealed class OpenWeatherWind
    {
        [JsonPropertyName("speed")]
        public double Speed { get; init; }
    }

    private sealed class OpenWeatherRain
    {
        [JsonPropertyName("3h")]
        public double LastThreeHours { get; init; }
    }
}
