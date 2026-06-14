using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Azure.Functions.Worker;
using SmartApiary.Application.Features.Spraying;

namespace SmartApiary.Functions.SprayingNotification;

public sealed class SprayingNotificationFunction
{
    private readonly ISprayingNotificationService _sprayingNotificationService;
    private readonly JsonSerializerOptions _jsonOptions;

    public SprayingNotificationFunction(ISprayingNotificationService sprayingNotificationService)
    {
        _sprayingNotificationService = sprayingNotificationService;
        _jsonOptions = new JsonSerializerOptions
        {
            Converters = { new JsonStringEnumConverter() }
        };
    }

    [Function("SprayingNotification")]
    public async Task Run(
        [QueueTrigger("spraying-notifications")] string messageText,
        CancellationToken cancellationToken)
    {
        var message = JsonSerializer.Deserialize<SprayingNotificationMessage>(messageText, _jsonOptions)
            ?? throw new InvalidOperationException("Failed to deserialize spraying notification queue message.");

        await _sprayingNotificationService.NotifyNearbyBeekeepersAsync(
            message,
            cancellationToken);
    }
}
