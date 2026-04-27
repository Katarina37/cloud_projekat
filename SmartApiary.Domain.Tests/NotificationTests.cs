using SmartApiary.Domain.Enums;
using SmartApiary.Domain.Models;

namespace SmartApiary.Domain.Tests;

public class NotificationTests
{
    [Fact]
    public void MarkAsRead_WhenNotificationIsAlreadyRead_KeepsOriginalReadTime()
    {
        var notification = new Notification(
            Guid.NewGuid(),
            NotificationType.WeightDrop,
            "Weight drop",
            "Hive weight dropped.");

        notification.MarkAsRead();
        var originalReadAt = notification.ReadAt;

        notification.MarkAsRead();

        Assert.True(notification.IsRead);
        Assert.Equal(originalReadAt, notification.ReadAt);
    }
}
