using MediatR;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.Interfaces.Services;
using SmartApiary.Domain.Enums;

namespace SmartApiary.Application.Behaviors;

public sealed class RoleAuthorizationBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly ICurrentUserService _currentUserService;

    public RoleAuthorizationBehavior(ICurrentUserService currentUserService)
    {
        _currentUserService = currentUserService;
    }

    public Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        var requiredRole = GetRequiredRole(typeof(TRequest));
        if (requiredRole is null)
        {
            return next(cancellationToken);
        }

        if (!_currentUserService.IsAuthenticated)
        {
            return Task.FromResult(CreateFailure("User is not authenticated."));
        }

        if (!string.Equals(_currentUserService.Role, requiredRole.ToString(), StringComparison.OrdinalIgnoreCase))
        {
            return Task.FromResult(CreateFailure($"User is not authorized for {requiredRole} resources."));
        }

        return next(cancellationToken);
    }

    private static UserRole? GetRequiredRole(Type requestType)
    {
        var namespaceName = requestType.Namespace ?? string.Empty;

        if (namespaceName.Contains(".Features.Auth.", StringComparison.Ordinal))
        {
            return null;
        }

        if (namespaceName.Contains(".Features.Telemetry.ReceiveTelemetry", StringComparison.Ordinal))
        {
            return null;
        }

        if (namespaceName.Contains(".Features.Admin.", StringComparison.Ordinal))
        {
            return UserRole.Admin;
        }

        if (RequiresAny(namespaceName, "Alerts", "Apiaries", "Devices", "HiveInspections", "Hives", "Notifications", "Telemetry"))
        {
            return UserRole.Beekeeper;
        }

        if (RequiresAny(namespaceName, "Crops", "Parcels", "Spraying"))
        {
            return UserRole.Farmer;
        }

        return null;
    }

    private static bool RequiresAny(string namespaceName, params string[] featureNames)
    {
        return featureNames.Any(featureName =>
            namespaceName.Contains($".Features.{featureName}.", StringComparison.Ordinal));
    }

    private static TResponse CreateFailure(string message)
    {
        if (typeof(TResponse) == typeof(Result))
        {
            return (TResponse)(object)Result.Failure(message, ErrorType.Unauthorized);
        }

        if (typeof(TResponse).IsGenericType
            && typeof(TResponse).GetGenericTypeDefinition() == typeof(Result<>))
        {
            var valueType = typeof(TResponse).GetGenericArguments()[0];
            var resultType = typeof(Result<>).MakeGenericType(valueType);
            var failureMethod = resultType.GetMethod(
                nameof(Result<object>.Failure),
                [typeof(string), typeof(ErrorType)])
                ?? throw new InvalidOperationException("Result failure factory was not found.");

            return (TResponse)failureMethod.Invoke(null, [message, ErrorType.Unauthorized])!;
        }

        throw new InvalidOperationException(
            $"Role authorization cannot create a failure response for {typeof(TResponse).Name}.");
    }
}
