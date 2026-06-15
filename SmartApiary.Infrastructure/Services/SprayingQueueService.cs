// Najave prskanja ovde stavljamo u Queue da ih Function obradi.
// Vezbe 5 - Queue Storage.

using System.Text.Json;
using System.Text.Json.Serialization;
using Azure.Storage.Queues;
using Azure.Storage.Queues.Models;
using Microsoft.Extensions.Configuration;
using SmartApiary.Application.Features.Spraying;
using SmartApiary.Application.Interfaces.Services;

namespace SmartApiary.Infrastructure.Services;

public sealed class SprayingQueueService : ISprayingQueueService
{
    private const string QueueName = "spraying-notifications";
    private readonly QueueClient _queueClient;
    private readonly JsonSerializerOptions _jsonOptions;

    public SprayingQueueService(IConfiguration configuration)
    {
        var connectionString = configuration["AzureStorage:ConnectionString"]
            ?? throw new InvalidOperationException("AzureStorage:ConnectionString is not configured.");

        _queueClient = new QueueClient(connectionString, QueueName, new QueueClientOptions
        {
            MessageEncoding = QueueMessageEncoding.Base64
        });

        _jsonOptions = new JsonSerializerOptions
        {
            Converters = { new JsonStringEnumConverter() }
        };
    }

    public async Task EnqueueAsync(SprayingNotificationMessage message, CancellationToken cancellationToken = default)
    {
        // Najava prvo ide u Queue, a Function posle obavestava pcelare.
        await _queueClient.CreateIfNotExistsAsync(cancellationToken: cancellationToken);
        var json = JsonSerializer.Serialize(message, _jsonOptions);
        await _queueClient.SendMessageAsync(json, cancellationToken);
    }
}
