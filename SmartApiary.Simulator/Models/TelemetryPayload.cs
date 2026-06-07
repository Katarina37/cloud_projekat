namespace SmartApiary.Simulator.Models;

public sealed record TelemetryPayload(
    double WeightKg,
    double HumidityPercent,
    double TemperatureCelsius,
    double BatteryPercent,
    DateTime Timestamp);
