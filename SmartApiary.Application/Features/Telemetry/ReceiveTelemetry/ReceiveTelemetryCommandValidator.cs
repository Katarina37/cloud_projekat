using FluentValidation;

namespace SmartApiary.Application.Features.Telemetry.ReceiveTelemetry;

public sealed class ReceiveTelemetryCommandValidator : AbstractValidator<ReceiveTelemetryCommand>
{
    public ReceiveTelemetryCommandValidator()
    {
        RuleFor(command => command.DeviceAccessToken)
            .NotEmpty();

        RuleFor(command => command.WeightKg)
            .GreaterThanOrEqualTo(0);

        RuleFor(command => command.HumidityPercent)
            .InclusiveBetween(0, 100);

        RuleFor(command => command.BatteryPercent)
            .InclusiveBetween(0, 100);

        RuleFor(command => command.Timestamp)
            .NotEqual(default(DateTime));
    }
}
