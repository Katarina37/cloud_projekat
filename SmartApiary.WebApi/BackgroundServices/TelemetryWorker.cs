using Microsoft.AspNetCore.SignalR;
using SmartApiary.Application.Interfaces.Services;
using SmartApiary.WebApi.DTOs;
using SmartApiary.WebApi.Hubs;

namespace SmartApiary.WebApi.BackgroundServices;

internal sealed class TelemetryWorker(
    IServiceProvider serviceProvider,
    IHubContext<TelemetryHub> hubContext,
    ILogger<TelemetryWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("[WORKER] Telemetry Worker started listening...");

        while (!stoppingToken.IsCancellationRequested)
        {
            var foundMessage = false;

            try
            {
                using var scope = serviceProvider.CreateScope();
                var queueService = scope.ServiceProvider
                    .GetRequiredService<ITelemetryQueueService>();

                var message = await queueService.ReceiveAsync(stoppingToken);

                if (message is not null)
                {
                    foundMessage = true;
                    var telemetry = message.Body;

                    logger.LogInformation(
                        "[WORKER] Received telemetry update for hive: {HiveId}",
                        telemetry.HiveId);

                    var telemetryDto = new TelemetryUpdateDto
                    {
                        ApiaryId = telemetry.ApiaryId,
                        HiveId = telemetry.HiveId,
                        DeviceId = telemetry.DeviceId,
                        Timestamp = telemetry.Timestamp,
                        Weight = telemetry.Weight,
                        Temperature = telemetry.Temperature,
                        Humidity = telemetry.Humidity,
                        BatteryLevel = telemetry.BatteryLevel
                    };

                    await hubContext.Clients
                        .Group(TelemetryHub.GetApiaryGroupName(telemetry.ApiaryId))
                        .SendAsync(
                            TelemetryHub.TelemetryUpdateEvent,
                            telemetryDto,
                            stoppingToken);

                    await message.CompleteAsync(stoppingToken);

                    logger.LogInformation(
                        "[WORKER] Telemetry update sent to clients and message deleted.");
                }
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                return;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "[ERROR] Error processing telemetry queue.");
            }

            if (!foundMessage)
            {
                await Task.Delay(2000, stoppingToken);
            }
        }
    }
}
