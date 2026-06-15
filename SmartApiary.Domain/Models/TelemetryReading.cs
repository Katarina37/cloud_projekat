// Podaci i osnovna pravila za TelemetryReading.

namespace SmartApiary.Domain.Models;

public class TelemetryReading
{
    public TelemetryReading(
        Guid hiveId,
        Guid deviceId,
        DateTime timestamp,
        double weightKg,
        double humidityPercent,
        double temperatureCelsius,
        double batteryPercent)
        : this(
            Guid.NewGuid(),
            hiveId,
            deviceId,
            timestamp,
            weightKg,
            humidityPercent,
            temperatureCelsius,
            batteryPercent)
    {
    }

    private TelemetryReading(
        Guid id,
        Guid hiveId,
        Guid deviceId,
        DateTime timestamp,
        double weightKg,
        double humidityPercent,
        double temperatureCelsius,
        double batteryPercent)
    {
        if (id == Guid.Empty)
        {
            throw new ArgumentException("Telemetry reading id cannot be empty.", nameof(id));
        }

        if (hiveId == Guid.Empty)
        {
            throw new ArgumentException("Hive id cannot be empty.", nameof(hiveId));
        }

        if (deviceId == Guid.Empty)
        {
            throw new ArgumentException("Device id cannot be empty.", nameof(deviceId));
        }

        Id = id;
        HiveId = hiveId;
        DeviceId = deviceId;
        Timestamp = timestamp;
        WeightKg = RequireNonNegative(weightKg, nameof(weightKg));
        HumidityPercent = RequirePercentage(humidityPercent, nameof(humidityPercent));
        TemperatureCelsius = temperatureCelsius;
        BatteryPercent = RequirePercentage(batteryPercent, nameof(batteryPercent));
    }

    public Guid Id { get; private set; }

    public Guid HiveId { get; private set; }

    public Guid DeviceId { get; private set; }

    public DateTime Timestamp { get; private set; }

    public double WeightKg { get; private set; }

    public double HumidityPercent { get; private set; }

    public double TemperatureCelsius { get; private set; }

    public double BatteryPercent { get; private set; }

    public static TelemetryReading Load(
        Guid id,
        Guid hiveId,
        Guid deviceId,
        DateTime timestamp,
        double weightKg,
        double humidityPercent,
        double temperatureCelsius,
        double batteryPercent)
    {
        return new TelemetryReading(
            id,
            hiveId,
            deviceId,
            timestamp,
            weightKg,
            humidityPercent,
            temperatureCelsius,
            batteryPercent);
    }

    private static double RequireNonNegative(double value, string parameterName)
    {
        if (value < 0)
        {
            throw new ArgumentOutOfRangeException(parameterName, "Value cannot be negative.");
        }

        return value;
    }

    private static double RequirePercentage(double value, string parameterName)
    {
        if (value is < 0 or > 100)
        {
            throw new ArgumentOutOfRangeException(parameterName, "Value must be in range [0, 100].");
        }

        return value;
    }
}
