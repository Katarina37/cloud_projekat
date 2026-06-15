// Slanje i citanje telemetrije preko Queue Storage-a.
// Vezbe 5 i 6 - Queue poruke i SignalR tok.

using System.Text.Json;
using Azure.Storage.Queues;
using Azure.Storage.Queues.Models;
using Microsoft.Extensions.Configuration;
using SmartApiary.Application.Features.Telemetry;
using SmartApiary.Application.Interfaces.Services;

namespace SmartApiary.Infrastructure.Services;

public sealed class TelemetryQueueService : ITelemetryQueueService
{
    private const string QueueName = "telemetry-updates";
    private readonly QueueClient _queueClient;
    private readonly JsonSerializerOptions _jsonOptions;
    private bool _queueCreated;

    public TelemetryQueueService(IConfiguration configuration)
    {
        var connectionString = configuration["AzureStorage:ConnectionString"]
            ?? throw new InvalidOperationException("AzureStorage:ConnectionString is not configured.");

        _queueClient = new QueueClient(connectionString, QueueName, new QueueClientOptions
        {
            MessageEncoding = QueueMessageEncoding.Base64
        });

        _jsonOptions = new JsonSerializerOptions(JsonSerializerDefaults.Web);
    }

    public async Task EnqueueAsync(
        TelemetryQueueMessage message,
        CancellationToken cancellationToken = default)
    {
        await EnsureQueueCreatedAsync(cancellationToken);

        // Queue poruku saljemo kao JSON.
        var json = JsonSerializer.Serialize(message, _jsonOptions);
        await _queueClient.SendMessageAsync(json, cancellationToken);
    }

    public async Task<IReceivedQueueMessage<TelemetryQueueMessage>?> ReceiveAsync(
        CancellationToken cancellationToken = default)
    {
        await EnsureQueueCreatedAsync(cancellationToken);

        // Uzimamo jednu poruku i sakrijemo je dok je worker obradjuje.
        var response = await _queueClient.ReceiveMessagesAsync(
            maxMessages: 1,
            visibilityTimeout: TimeSpan.FromSeconds(30),
            cancellationToken: cancellationToken);
        var message = response.Value.FirstOrDefault();

        if (message is null)
        {
            return null;
        }

        var body = JsonSerializer.Deserialize<TelemetryQueueMessage>(
            message.MessageText,
            _jsonOptions);

        if (body is null)
        {
            await _queueClient.DeleteMessageAsync(
                message.MessageId,
                message.PopReceipt,
                cancellationToken);
            return null;
        }

        // Cuvamo i podatke potrebne za kasnije brisanje poruke.
        return new ReceivedTelemetryQueueMessage(
            _queueClient,
            message.MessageId,
            message.PopReceipt,
            body);
    }

    private async Task EnsureQueueCreatedAsync(CancellationToken cancellationToken)
    {
        if (_queueCreated)
        {
            return;
        }

        await _queueClient.CreateIfNotExistsAsync(cancellationToken: cancellationToken);
        _queueCreated = true;
    }

    private sealed class ReceivedTelemetryQueueMessage
        : IReceivedQueueMessage<TelemetryQueueMessage>
    {
        private readonly QueueClient _queueClient;
        private readonly string _messageId;
        private readonly string _popReceipt;

        public ReceivedTelemetryQueueMessage(
            QueueClient queueClient,
            string messageId,
            string popReceipt,
            TelemetryQueueMessage body)
        {
            _queueClient = queueClient;
            _messageId = messageId;
            _popReceipt = popReceipt;
            Body = body;
        }

        public TelemetryQueueMessage Body { get; }

        public Task CompleteAsync(CancellationToken cancellationToken = default)
        {
            // Gotovo je, brisemo poruku.
            return _queueClient.DeleteMessageAsync(
                _messageId,
                _popReceipt,
                cancellationToken);
        }
    }
}
