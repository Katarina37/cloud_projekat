using Microsoft.AspNetCore.SignalR;

namespace SmartApiary.WebApi.Hubs;

public sealed class TelemetryHub : Hub
{
    public const string TelemetryUpdateEvent = "ReceiveTelemetryUpdate";

    public Task JoinApiaryGroup(Guid apiaryId)
    {
        return Groups.AddToGroupAsync(
            Context.ConnectionId,
            GetApiaryGroupName(apiaryId));
    }

    public Task LeaveApiaryGroup(Guid apiaryId)
    {
        return Groups.RemoveFromGroupAsync(
            Context.ConnectionId,
            GetApiaryGroupName(apiaryId));
    }

    public static string GetApiaryGroupName(Guid apiaryId)
    {
        return $"apiary-{apiaryId}";
    }
}
