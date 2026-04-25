using FluentValidation;
using MediatR;
using SmartApiary.Application.Common.Results;

namespace SmartApiary.Application.Behaviors;

public sealed class ValidationBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly IEnumerable<IValidator<TRequest>> _validators;

    public ValidationBehavior(IEnumerable<IValidator<TRequest>> validators)
    {
        _validators = validators;
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        if (!_validators.Any())
        {
            return await next(cancellationToken);
        }

        var context = new ValidationContext<TRequest>(request);
        var validationResults = await Task.WhenAll(
            _validators.Select(validator => validator.ValidateAsync(context, cancellationToken)));

        var errors = validationResults
            .SelectMany(result => result.Errors)
            .Where(failure => failure is not null)
            .Select(failure => failure.ErrorMessage)
            .Distinct()
            .ToArray();

        if (errors.Length == 0)
        {
            return await next(cancellationToken);
        }

        var error = string.Join(" ", errors);

        if (typeof(TResponse) == typeof(Result))
        {
            return (TResponse)(object)Result.Failure(error);
        }

        if (typeof(TResponse).IsGenericType &&
            typeof(TResponse).GetGenericTypeDefinition() == typeof(Result<>))
        {
            var failureFactory = typeof(TResponse).GetMethod(nameof(Result.Failure), [typeof(string)])
                ?? throw new InvalidOperationException("Result failure factory was not found.");

            return (TResponse)failureFactory.Invoke(null, [error])!;
        }

        throw new InvalidOperationException("ValidationBehavior supports only Result responses.");
    }
}
