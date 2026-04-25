using SmartApiary.Application.DTOs;

namespace SmartApiary.Application.Interfaces.Services;

public interface IWeatherService
{
    Task<WeatherInfoDto?> GetWeatherAsync(double latitude, double longitude, DateTime dateTime, CancellationToken cancellationToken = default);
}
