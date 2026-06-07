using SmartApiary.Application.Features.Telemetry;

namespace SmartApiary.Application.Interfaces.Services;

public interface ITelemetryQueueService
{
    Task EnqueueAsync(
        TelemetryQueueMessage message,
        CancellationToken cancellationToken = default);

    Task<IReceivedQueueMessage<TelemetryQueueMessage>?> ReceiveAsync(
        CancellationToken cancellationToken = default);
}
