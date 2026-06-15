// Podaci koji stizu kada oznacavamo obavestenje kao procitano.

using MediatR;
using SmartApiary.Application.Common.Results;

namespace SmartApiary.Application.Features.Notifications.MarkNotificationAsRead;

public sealed record MarkNotificationAsReadCommand(Guid NotificationId) : IRequest<Result>;
