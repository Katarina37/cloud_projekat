// HTTP rute za Auth. Glavni posao prosledjujemo handlerima.

using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartApiary.Application.Features.Auth.ActivateAccount;
using SmartApiary.Application.Features.Auth.ForgotPassword;
using SmartApiary.Application.Features.Auth.Login;
using SmartApiary.Application.Features.Auth.ResetPassword;

namespace SmartApiary.WebApi.Controllers;

[AllowAnonymous]
public sealed class AuthController : BaseController
{
    public AuthController(IMediator mediator)
        : base(mediator)
    {
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginCommand command, CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(command, cancellationToken);
        return HandleResult(result);
    }

    [HttpPost("activate")]
    public async Task<IActionResult> Activate(
        ActivateAccountCommand command,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(command, cancellationToken);
        return HandleResult(result);
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(
        ForgotPasswordCommand command,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(command, cancellationToken);
        return HandleResult(result);
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword(
        ResetPasswordCommand command,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(command, cancellationToken);
        return HandleResult(result);
    }
}
