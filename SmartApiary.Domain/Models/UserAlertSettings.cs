// Podaci i osnovna pravila za UserAlertSettings.

namespace SmartApiary.Domain.Models;

public class UserAlertSettings
{
    private const double DefaultWeightDropThresholdKg = 10;

    public UserAlertSettings(Guid userId)
    {
        if (userId == Guid.Empty)
        {
            throw new ArgumentException("User id cannot be empty.", nameof(userId));
        }

        Id = Guid.NewGuid();
        UserId = userId;
        WeightDropThresholdKg = DefaultWeightDropThresholdKg;
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = CreatedAt;
    }

    public Guid Id { get; private set; }

    public Guid UserId { get; private set; }

    public double WeightDropThresholdKg { get; private set; }

    public DateTime CreatedAt { get; private set; }

    public DateTime UpdatedAt { get; private set; }

    public void UpdateWeightDropThreshold(double thresholdKg)
    {
        if (thresholdKg <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(thresholdKg), "Threshold must be greater than zero.");
        }

        WeightDropThresholdKg = thresholdKg;
        UpdatedAt = DateTime.UtcNow;
    }
}
