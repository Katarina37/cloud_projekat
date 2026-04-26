using MediatR;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.DTOs;

namespace SmartApiary.Application.Features.Notifications.GetMyNotifications;

public sealed record GetMyNotificationsQuery : IRequest<Result<IReadOnlyList<NotificationDto>>>;
