// Jedan deo podrske za Table Storage: ITableMapper.
// Specifikacija - telemetriju drzimo van SQL baze.
// Vezbe 4 - PartitionKey, RowKey i mapiranje Table entiteta.

using Azure.Data.Tables;

namespace SmartApiary.Infrastructure.TableStorage;

internal interface ITableMapper<TDomain, TEntity>
    where TEntity : class, ITableEntity, new()
{
    TEntity ToEntity(TDomain domain);

    TDomain? ToDomain(TEntity entity);
}
