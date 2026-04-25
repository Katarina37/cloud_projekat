using MediatR;
using SmartApiary.Application.Common.Results;

namespace SmartApiary.Application.Features.Telemetry.ReceiveTelemetry;

public sealed record ReceiveTelemetryCommand(
    string DeviceAccessToken,
    double WeightKg,
    double HumidityPercent,
    double TemperatureCelsius,
    double BatteryPercent,
    DateTime Timestamp) : IRequest<Result>;
