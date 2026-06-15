// Worker uzima telemetriju iz Queue-a i gura je frontu preko SignalR-a.
// Specifikacija - telemetrija uzivo.
// Vezbe 6 - Background Worker i SignalR.

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

        // Vrtimo petlju dok se Web API ne ugasi.
        while (!stoppingToken.IsCancellationRequested)
        {
            var foundMessage = false;

            try
            {
                // Za svaki prolaz uzimamo novi scope.
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

                    // Pakujemo poruku u format koji frontend ocekuje.
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

                    // Saljemo samo grupi ovog pcelinjaka.
                    await hubContext.Clients
                        .Group(TelemetryHub.GetApiaryGroupName(telemetry.ApiaryId))
                        .SendAsync(
                            TelemetryHub.TelemetryUpdateEvent,
                            telemetryDto,
                            stoppingToken);

                    // Posle slanja brisemo poruku iz Queue-a.
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

            // Kad nema poruka, sacekamo dve sekunde.
            if (!foundMessage)
            {
                await Task.Delay(2000, stoppingToken);
            }
        }
    }
}
