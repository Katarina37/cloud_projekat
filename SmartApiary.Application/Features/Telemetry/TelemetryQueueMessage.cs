namespace SmartApiary.Application.Features.Telemetry;

public sealed record TelemetryQueueMessage(
    Guid ApiaryId,
    Guid HiveId,
    Guid DeviceId,
    DateTime Timestamp,
    double Weight,
    double Temperature,
    double Humidity,
    double BatteryLevel);
