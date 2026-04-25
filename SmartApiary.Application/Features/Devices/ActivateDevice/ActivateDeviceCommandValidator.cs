using FluentValidation;

namespace SmartApiary.Application.Features.Devices.ActivateDevice;

public sealed class ActivateDeviceCommandValidator : AbstractValidator<ActivateDeviceCommand>
{
    public ActivateDeviceCommandValidator()
    {
        RuleFor(command => command.SerialNumber)
            .NotEmpty();

        RuleFor(command => command.DeviceIdentifier)
            .NotEmpty()
            .Must(BeValidUuid)
            .WithMessage("Device identifier must be a valid UUID.");
    }

    private static bool BeValidUuid(string? value)
    {
        return Guid.TryParse(value, out _);
    }
}
