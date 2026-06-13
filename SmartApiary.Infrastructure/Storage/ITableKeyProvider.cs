namespace SmartApiary.Infrastructure.TableStorage;

internal interface ITableKeyProvider<in TModel>
{
    string GetPartitionKey(TModel model);

    string GetRowKey(TModel model);
}
