namespace SmartApiary.Application.Common.Results;

public class Result<T> : Result
{
    private Result(T? value, bool isSuccess, Error? error, string? warning)
        : base(isSuccess, error, warning)
    {
        Value = value;
    }

    public T? Value { get; }

    public static Result<T> Success(T value, string? warning = null)
    {
        return new Result<T>(value, true, null, warning);
    }

    public static new Result<T> Failure(string message, ErrorType type = ErrorType.Failure)
    {
        return new Result<T>(default, false, new Error(message, type), null);
    }
}
