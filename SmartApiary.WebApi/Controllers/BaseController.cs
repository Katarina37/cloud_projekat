using MediatR;
using Microsoft.AspNetCore.Mvc;
using SmartApiary.Application.Common.Results;

namespace SmartApiary.WebApi.Controllers;

[ApiController]
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
        return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
    }

    protected IActionResult HandleResult<T>(Result<T> result)
    {
        return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
    }
}
