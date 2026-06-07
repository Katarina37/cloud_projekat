namespace SmartApiary.Application.Interfaces.Services;

public interface IReceivedQueueMessage<T>
{
    T Body { get; }

    Task CompleteAsync(CancellationToken cancellationToken = default);
}
