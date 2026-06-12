namespace SmartApiary.Application.Common.Results;

public class Result
{
    protected Result(bool isSuccess, Error? error, string? warning)
    {
        IsSuccess = isSuccess;
        Error = error;
        Warning = warning;
    }

    public bool IsSuccess { get; }

    public bool IsFailure => !IsSuccess;

    public Error? Error { get; }

    public string? Warning { get; }

    public static Result Success(string? warning = null)
    {
        return new Result(true, null, warning);
    }

    public static Result Failure(string message, ErrorType type = ErrorType.Failure)
    {
        return new Result(false, new Error(message, type), null);
    }
}
