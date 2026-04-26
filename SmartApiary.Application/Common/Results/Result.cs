namespace SmartApiary.Application.Common.Results;

public class Result
{
    private Result(bool isSuccess, string? error, string? warning)
    {
        IsSuccess = isSuccess;
        Error = error;
        Warning = warning;
    }

    public bool IsSuccess { get; }

    public bool IsFailure => !IsSuccess;

    public string? Error { get; }

    public string? Warning { get; }

    public static Result Success(string? warning = null)
    {
        return new Result(true, null, warning);
    }

    public static Result Failure(string error)
    {
        return new Result(false, error, null);
    }
}
