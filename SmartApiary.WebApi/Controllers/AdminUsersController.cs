using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartApiary.Application.Features.Admin.Users.CreateUser;
using SmartApiary.Application.Features.Admin.Users.DeactivateUser;
using SmartApiary.Application.Features.Admin.Users.GetUsers;

namespace SmartApiary.WebApi.Controllers;

[Authorize(Roles = "Admin")]
[Route("api/admin/users")]
public sealed class AdminUsersController : BaseController
{
    public AdminUsersController(IMediator mediator)
        : base(mediator)
    {
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        CreateUserCommand command,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(command, cancellationToken);
        return HandleCreatedResult(result, nameof(Get));
    }

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new GetUsersQuery(), cancellationToken);
        return HandleResult(result);
    }

    [HttpPut("{id:guid}/deactivate")]
    public async Task<IActionResult> Deactivate(Guid id, CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new DeactivateUserCommand(id), cancellationToken);
        return HandleResult(result);
    }
}
