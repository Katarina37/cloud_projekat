// Jedan deo podrske za Table Storage: BaseTableEntity.
// Specifikacija - telemetriju drzimo van SQL baze.
// Vezbe 4 - PartitionKey, RowKey i mapiranje Table entiteta.

using Azure;
using Azure.Data.Tables;

namespace SmartApiary.Infrastructure.TableStorage;

internal class BaseTableEntity : ITableEntity
{
    public string PartitionKey { get; set; } = default!;

    public string RowKey { get; set; } = default!;

    public DateTimeOffset? Timestamp { get; set; }

    public ETag ETag { get; set; }
}
