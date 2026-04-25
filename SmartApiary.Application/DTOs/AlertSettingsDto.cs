namespace SmartApiary.Application.DTOs;

public class AlertSettingsDto
{
    public Guid UserId { get; set; }

    public double WeightDropThresholdKg { get; set; }

    public DateTime UpdatedAt { get; set; }
}
