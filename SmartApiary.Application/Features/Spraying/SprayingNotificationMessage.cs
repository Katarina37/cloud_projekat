// Poruka koju saljemo za SprayingNotificationMessage.

using SmartApiary.Domain.Enums;

namespace SmartApiary.Application.Features.Spraying;

public sealed record SprayingNotificationMessage(
    Guid AnnouncementId,
    Guid ParcelId,
    Guid FarmerId,
    string ParcelName,
    DateTime StartTime,
    int DurationHours,
    string? PreparationType,
    double Latitude,
    double Longitude,
    string Title,
    string Message,
    NotificationType NotificationType);
