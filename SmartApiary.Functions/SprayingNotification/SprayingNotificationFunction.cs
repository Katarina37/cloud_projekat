// Ova Function se sama pali kada u Queue stigne najava prskanja.
// Specifikacija - obavestenje pcelarima u krugu od 5 km.
// Vezbe 5 - Queue trigger.

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
        // Vezbe 5: Queue trigger sam pozove ovu metodu.
        var message = JsonSerializer.Deserialize<SprayingNotificationMessage>(messageText, _jsonOptions)
            ?? throw new InvalidOperationException("Failed to deserialize spraying notification queue message.");

        // Posle trazimo pcelinjake u krugu od 5 km.
        await _sprayingNotificationService.NotifyNearbyBeekeepersAsync(
            message,
            cancellationToken);
    }
}
