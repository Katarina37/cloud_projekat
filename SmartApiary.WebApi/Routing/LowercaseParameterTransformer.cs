// Sredjuje da URL rute budu malim slovima.

using Microsoft.AspNetCore.Routing;

namespace SmartApiary.WebApi.Routing;

public sealed class LowercaseParameterTransformer : IOutboundParameterTransformer
{
    public string? TransformOutbound(object? value)
    {
        return value?.ToString()?.ToLowerInvariant();
    }
}
