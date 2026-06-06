using SmartApiary.Application.Features.Spraying;

namespace SmartApiary.Application.Interfaces.Services;

public interface ISprayingQueueService
{
    Task EnqueueAsync(SprayingNotificationMessage message, CancellationToken cancellationToken = default);
}
