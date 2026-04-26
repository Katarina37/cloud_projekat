using MediatR;
using Microsoft.AspNetCore.Mvc;
using SmartApiary.Application.Features.Notifications.GetMyNotifications;
using SmartApiary.Application.Features.Notifications.MarkNotificationAsRead;

namespace SmartApiary.WebApi.Controllers;

public sealed class NotificationsController : BaseController
{
    public NotificationsController(IMediator mediator)
        : base(mediator)
    {
    }

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new GetMyNotificationsQuery(), cancellationToken);
        return HandleResult(result);
    }

    [HttpPut("{id:guid}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id, CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new MarkNotificationAsReadCommand(id), cancellationToken);

        if (result.IsFailure && result.Error == "Notification was not found.")
        {
            return NotFound(result.Error);
        }

        return HandleResult(result);
    }
}
