using SmartApiary.Domain.Enums;
using SmartApiary.Domain.Exceptions;
using SmartApiary.Domain.Models;

namespace SmartApiary.Domain.Tests;

public class SprayingAnnouncementTests
{
    [Fact]
    public void Reschedule_WhenAnnouncementIsCancelled_ThrowsAndKeepsOriginalSchedule()
    {
        var announcement = CreateAnnouncement();
        var originalStartTime = announcement.StartTime;
        var originalDurationHours = announcement.DurationHours;

        announcement.Cancel();

        Assert.Throws<DomainException>(() =>
            announcement.Reschedule(originalStartTime.AddDays(1), originalDurationHours + 1));
        Assert.Equal(SprayingStatus.Cancelled, announcement.Status);
        Assert.Equal(originalStartTime, announcement.StartTime);
        Assert.Equal(originalDurationHours, announcement.DurationHours);
    }

    [Fact]
    public void Complete_WhenAnnouncementIsAlreadyCompleted_ThrowsAndKeepsCompletedStatus()
    {
        var announcement = CreateAnnouncement();
        announcement.Complete();

        Assert.Throws<DomainException>(() => announcement.Complete());

        Assert.Equal(SprayingStatus.Completed, announcement.Status);
    }

    [Fact]
    public void Cancel_WhenAnnouncementIsAlreadyCompleted_ThrowsAndKeepsCompletedStatus()
    {
        var announcement = CreateAnnouncement();
        announcement.Complete();

        Assert.Throws<DomainException>(() => announcement.Cancel());

        Assert.Equal(SprayingStatus.Completed, announcement.Status);
        Assert.Null(announcement.CancelledAt);
    }

    [Fact]
    public void Complete_WhenAnnouncementIsCancelled_ThrowsAndKeepsCancelledStatus()
    {
        var announcement = CreateAnnouncement();
        announcement.Cancel();
        var cancelledAt = announcement.CancelledAt;

        Assert.Throws<DomainException>(() => announcement.Complete());

        Assert.Equal(SprayingStatus.Cancelled, announcement.Status);
        Assert.Equal(cancelledAt, announcement.CancelledAt);
    }

    private static SprayingAnnouncement CreateAnnouncement()
    {
        return new SprayingAnnouncement(
            Guid.NewGuid(),
            new DateTime(2026, 5, 1, 8, 0, 0, DateTimeKind.Utc),
            2,
            "Test preparation");
    }
}
