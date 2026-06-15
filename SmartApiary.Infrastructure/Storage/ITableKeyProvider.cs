// Jedan deo podrske za Table Storage: ITableKeyProvider.
// Specifikacija - telemetriju drzimo van SQL baze.
// Vezbe 4 - PartitionKey, RowKey i mapiranje Table entiteta.

namespace SmartApiary.Infrastructure.TableStorage;

internal interface ITableKeyProvider<in TModel>
{
    string GetPartitionKey(TModel model);

    string GetRowKey(TModel model);
}
