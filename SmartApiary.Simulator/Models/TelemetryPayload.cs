namespace SmartApiary.Simulator.Models;

public sealed record TelemetryPayload(
    string DeviceAccessToken,
    double WeightKg,
    double HumidityPercent,
    double TemperatureCelsius,
    double BatteryPercent,
    DateTime Timestamp);
