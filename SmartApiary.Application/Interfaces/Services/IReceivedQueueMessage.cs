// Ovde su metode koje IReceivedQueueMessage servis mora da ima.

namespace SmartApiary.Application.Interfaces.Services;

public interface IReceivedQueueMessage<T>
{
    T Body { get; }

    Task CompleteAsync(CancellationToken cancellationToken = default);
}
