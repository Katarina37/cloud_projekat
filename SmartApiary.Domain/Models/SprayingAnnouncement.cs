using SmartApiary.Domain.Enums;
using SmartApiary.Domain.Exceptions;
using System.Data;

namespace SmartApiary.Domain.Models;

public class SprayingAnnouncement
{
    public SprayingAnnouncement(
        Guid parcelId,
        DateTime startTime,
        int durationHours,
        string? preparationType = null)
    {
        if (parcelId == Guid.Empty)
        {
            throw new ArgumentException("Parcel id cannot be empty.", nameof(parcelId));
        }

        Id = Guid.NewGuid();
        ParcelId = parcelId;
        StartTime = startTime;
        DurationHours = RequirePositiveDuration(durationHours);
        PreparationType = preparationType;
        Status = SprayingStatus.Scheduled;
        NotifiedBeekeepersCount = 0;
        CreatedAt = DateTime.UtcNow;
    }

    public Guid Id { get; private set; }

    public Guid ParcelId { get; private set; }

    public DateTime StartTime { get; private set; }

    public int DurationHours { get; private set; }

    public string? PreparationType { get; private set; }

    public SprayingStatus Status { get; private set; }

    public int NotifiedBeekeepersCount { get; private set; }

    public DateTime CreatedAt { get; private set; }

    public DateTime? CancelledAt { get; private set; }

    public DateTime? EndTime { get; private set; }
    public string? WeatherSnapshotJson { get; private set; }

    public void Reschedule(DateTime startTime, int durationHours)
    {
        EnsureCanChangeLifecycle();

        StartTime = startTime;
        DurationHours = RequirePositiveDuration(durationHours);
    }

    public void Cancel()
    {
        EnsureCanChangeLifecycle();

        Status = SprayingStatus.Cancelled;
        CancelledAt = DateTime.UtcNow;
    }

    public void Complete(string? weatherSnapshotJson = null)
    {
        EnsureCanChangeLifecycle();
        EndTime = DateTime.UtcNow;
        WeatherSnapshotJson = weatherSnapshotJson;
        Status = SprayingStatus.Completed;
    }

    public void SetNotifiedBeekeepersCount(int count)
    {
        if (count < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(count), "Count cannot be negative.");
        }

        NotifiedBeekeepersCount = count;
    }

    private static int RequirePositiveDuration(int durationHours)
    {
        if (durationHours <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(durationHours), "Duration must be greater than zero.");
        }

        return durationHours;
    }

    private void EnsureCanChangeLifecycle()
    {
        if (Status == SprayingStatus.Cancelled)
        {
            throw new DomainException("Cancelled spraying announcement cannot be changed.");
        }

        if (Status == SprayingStatus.Completed)
        {
            throw new DomainException("Completed spraying announcement cannot be changed.");
        }
    }
}
