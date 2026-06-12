using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SmartApiary.Application.Common.Results;
using System.Text.Json;

namespace SmartApiary.WebApi.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public abstract class BaseController : ControllerBase
{
    protected BaseController(IMediator mediator)
    {
        Mediator = mediator;
    }

    protected IMediator Mediator { get; }

    protected IActionResult HandleResult(Result result)
    {
        return result.IsSuccess ? Ok(result) : HandleFailure(result.Error);
    }

    protected IActionResult HandleResult<T>(Result<T> result)
    {
        return result.IsSuccess ? Ok(result) : HandleFailure(result.Error);
    }

    protected IActionResult HandleCreatedResult(Result result)
    {
        return result.IsSuccess
            ? StatusCode(StatusCodes.Status201Created, result)
            : HandleFailure(result.Error);
    }

    protected IActionResult HandleCreatedResult<T>(
        Result<T> result,
        string? actionName = null,
        object? routeValues = null)
    {
        if (result.IsFailure)
        {
            return HandleFailure(result.Error);
        }

        return actionName is null
            ? StatusCode(StatusCodes.Status201Created, result)
            : CreatedAtAction(actionName, routeValues, result);
    }

    protected IActionResult HandleDeletedResult(Result result)
    {
        return result.IsSuccess ? NoContent() : HandleFailure(result.Error);
    }

    protected IActionResult HandleFailure(Error? error)
    {
        if (error is null)
        {
            return BadRequest();
        }

        var errorResponse = CreateErrorResponse(error);

        return error.Type switch
        {
            ErrorType.Validation => BadRequest(errorResponse),
            ErrorType.NotFound => NotFound(errorResponse),
            ErrorType.Conflict => Conflict(errorResponse),
            ErrorType.Unauthorized => Unauthorized(errorResponse),
            ErrorType.Unexpected => StatusCode(StatusCodes.Status500InternalServerError, errorResponse),
            _ => BadRequest(errorResponse)
        };
    }

    private static object CreateErrorResponse(Error error)
    {
        if (error.Type != ErrorType.Validation)
        {
            return new
            {
                type = error.Type.ToString(),
                errors = (object?)null,
                message = error.Message
            };
        }

        object validationErrors = error.Message;

        try
        {
            var deserializedErrors =
                JsonSerializer.Deserialize<Dictionary<string, string[]>>(error.Message);

            if (deserializedErrors is not null)
            {
                validationErrors = deserializedErrors;
            }
        }
        catch (JsonException)
        {
        }

        return new
        {
            type = error.Type.ToString(),
            errors = validationErrors,
            message = "Validation failed."
        };
    }
}
