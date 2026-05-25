using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Application.Interfaces.Services;
using SmartApiary.Infrastructure.Persistence;
using SmartApiary.Infrastructure.Repositories;
using SmartApiary.Infrastructure.Services;

namespace SmartApiary.Infrastructure.Extensions;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' was not found.");

        services.AddDbContext<SmartApiaryDbContext>(options =>
            options.UseSqlServer(connectionString));

        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IApiaryRepository, ApiaryRepository>();
        services.AddScoped<IHiveRepository, HiveRepository>();
        services.AddScoped<IHiveInspectionRepository, HiveInspectionRepository>();
        services.AddScoped<IDeviceRepository, DeviceRepository>();
        services.AddScoped<IParcelRepository, ParcelRepository>();
        services.AddScoped<ICropRepository, CropRepository>();
        services.AddScoped<ISprayingAnnouncementRepository, SprayingAnnouncementRepository>();
        services.AddScoped<ITelemetryRepository, TelemetryRepository>();
        services.AddScoped<INotificationRepository, NotificationRepository>();
        services.AddScoped<IUserAlertSettingsRepository, UserAlertSettingsRepository>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.Configure<JwtOptions>(configuration.GetSection(JwtOptions.SectionName));
        services.AddSingleton<IDateTimeProvider, DateTimeProvider>();
        services.AddSingleton<IDeviceTokenGenerator, DeviceTokenGenerator>();
        services.AddSingleton<IAccountTokenGenerator, AccountTokenGenerator>();
        services.AddSingleton<IPasswordHasher, PasswordHasher>();
        services.AddSingleton<IJwtTokenGenerator, JwtTokenGenerator>();
        services.AddSingleton<IEmailService, EmailService>();
        services.AddScoped<INotificationSender, NoopNotificationSender>();
        services.AddHttpClient<IWeatherService, WeatherService>(client =>
        {
            client.BaseAddress = new Uri("https://api.openweathermap.org/");
            client.Timeout = TimeSpan.FromSeconds(10);
        });

        return services;
    }
}
