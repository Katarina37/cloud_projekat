using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SmartApiary.Application.Common.Results;

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

    protected IActionResult HandleFailure(string? error)
    {
        if (IsNotFoundError(error))
        {
            return NotFound(error);
        }

        if (IsUnauthorizedError(error))
        {
            return Unauthorized(error);
        }

        if (IsForbiddenError(error))
        {
            return StatusCode(StatusCodes.Status403Forbidden, error);
        }

        return BadRequest(error);
    }

    private static bool IsNotFoundError(string? error)
    {
        return Contains(error, "not found");
    }

    private static bool IsUnauthorizedError(string? error)
    {
        return Contains(error, "not authenticated")
            || Contains(error, "unauthorized");
    }

    private static bool IsForbiddenError(string? error)
    {
        return Contains(error, "does not belong")
            || Contains(error, "forbidden")
            || Contains(error, "not allowed")
            || Contains(error, "not authorized");
    }

    private static bool Contains(string? value, string expected)
    {
        return value?.Contains(expected, StringComparison.OrdinalIgnoreCase) == true;
    }
}
