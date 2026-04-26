namespace SmartApiary.Application.Common.Results;

public class Result<T>
{
    private Result(bool isSuccess, T? value, string? error, string? warning)
    {
        IsSuccess = isSuccess;
        Value = value;
        Error = error;
        Warning = warning;
    }

    public bool IsSuccess { get; }

    public bool IsFailure => !IsSuccess;

    public string? Error { get; }

    public string? Warning { get; }

    public T? Value { get; }

    public static Result<T> Success(T value, string? warning = null)
    {
        return new Result<T>(true, value, null, warning);
    }

    public static Result<T> Failure(string error)
    {
        return new Result<T>(false, default, error, null);
    }
}
