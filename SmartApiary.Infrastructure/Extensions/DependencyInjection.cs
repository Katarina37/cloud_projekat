using Azure.Data.Tables;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SmartApiary.Application.Features.Spraying;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Application.Interfaces.Services;
using SmartApiary.Domain.Models;
using SmartApiary.Infrastructure.Persistence;
using SmartApiary.Infrastructure.Repositories;
using SmartApiary.Infrastructure.Services;
using SmartApiary.Infrastructure.TableStorage;

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
            options.UseSqlServer(
                connectionString,
                sqlServerOptions => sqlServerOptions.UseNetTopologySuite()));

        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IApiaryRepository, ApiaryRepository>();
        services.AddScoped<IHiveRepository, HiveRepository>();
        services.AddScoped<IHiveInspectionRepository, HiveInspectionRepository>();
        services.AddScoped<IDeviceRepository, DeviceRepository>();
        services.AddScoped<IParcelRepository, ParcelRepository>();
        services.AddScoped<ICropRepository, CropRepository>();
        services.AddScoped<ISprayingAnnouncementRepository, SprayingAnnouncementRepository>();

        services.Configure<AzureTableOptions>(
            configuration.GetSection(AzureTableOptions.SectionName));

        var storageConnectionString = configuration[
            $"{AzureTableOptions.SectionName}:ConnectionString"]
            ?? throw new InvalidOperationException(
                $"{AzureTableOptions.SectionName}:ConnectionString is not configured.");

        services.AddSingleton(new TableServiceClient(storageConnectionString));
        services.AddSingleton<
            ITableMapper<TelemetryReading, TelemetryTableEntity>,
            TelemetryTableMapper>();
        services.AddSingleton<
            ITableKeyProvider<TelemetryReading>,
            TelemetryTableKeyProvider>();
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
        services.AddSingleton<IFileStorageService, BlobStorageService>();
        services.AddSingleton<ITelemetryQueueService, TelemetryQueueService>();
        services.AddSingleton<ISprayingQueueService, SprayingQueueService>();
        services.AddScoped<INotificationSender, RealNotificationSender>();
        services.AddScoped<ISprayingNotificationService, SprayingNotificationService>();
        services.AddHttpClient<IWeatherService, WeatherService>(client =>
        {
            client.BaseAddress = new Uri("https://api.openweathermap.org/");
            client.Timeout = TimeSpan.FromSeconds(10);
        });

        return services;
    }
}
