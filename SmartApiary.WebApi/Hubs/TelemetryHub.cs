// SignalR veza za telemetriju. Svaki pcelinjak ima svoju grupu.
// Vezbe 6 - SignalR Hub.

using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using SmartApiary.Application.Features.Apiaries.CheckApiaryOwnership;

namespace SmartApiary.WebApi.Hubs;

[Authorize(Roles = "Beekeeper")]
public sealed class TelemetryHub(IMediator mediator) : Hub
{
    public const string TelemetryUpdateEvent = "ReceiveTelemetryUpdate";

    public async Task JoinApiaryGroup(Guid apiaryId)
    {
        // Ne pustamo korisnika u grupu tudjeg pcelinjaka.
        var ownershipResult = await mediator.Send(
            new CheckApiaryOwnershipQuery(apiaryId),
            Context.ConnectionAborted);

        if (ownershipResult.IsFailure)
        {
            throw new HubException(
                ownershipResult.Error?.Message
                ?? "Access to this apiary is not allowed.");
        }

        // Jedna grupa = jedan pcelinjak.
        await Groups.AddToGroupAsync(
            Context.ConnectionId,
            GetApiaryGroupName(apiaryId),
            Context.ConnectionAborted);
    }

    public Task LeaveApiaryGroup(Guid apiaryId)
    {
        return Groups.RemoveFromGroupAsync(
            Context.ConnectionId,
            GetApiaryGroupName(apiaryId),
            Context.ConnectionAborted);
    }

    public static string GetApiaryGroupName(Guid apiaryId)
    {
        return $"apiary-{apiaryId}";
    }
}
