using System.Net;
using SmartApiary.Application.Common.Results;

namespace SmartApiary.Functions.Extensions;

internal static class ResultExtensions
{
    public static HttpStatusCode ToHttpStatusCode(this Result result)
    {
        return result.Error?.Type switch
        {
            ErrorType.Validation => HttpStatusCode.BadRequest,
            ErrorType.NotFound => HttpStatusCode.NotFound,
            ErrorType.Conflict => HttpStatusCode.Conflict,
            ErrorType.Unauthorized => HttpStatusCode.Unauthorized,
            ErrorType.Unexpected => HttpStatusCode.InternalServerError,
            _ => HttpStatusCode.BadRequest
        };
    }
}
