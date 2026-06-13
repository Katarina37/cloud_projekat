using Azure.Data.Tables;

namespace SmartApiary.Infrastructure.TableStorage;

internal interface ITableMapper<TDomain, TEntity>
    where TEntity : class, ITableEntity, new()
{
    TEntity ToEntity(TDomain domain);

    TDomain? ToDomain(TEntity entity);
}
