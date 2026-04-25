using FluentValidation;

namespace SmartApiary.Application.Features.Devices.RegisterDevice;

public sealed class RegisterDeviceCommandValidator : AbstractValidator<RegisterDeviceCommand>
{
    public RegisterDeviceCommandValidator()
    {
        RuleFor(command => command.HiveId)
            .NotEmpty();

        RuleFor(command => command.SerialNumber)
            .NotEmpty()
            .Matches("^SA-\\d{4}-\\d{5}$")
            .WithMessage("Serial number must match the format SA-YYYY-XXXXX.");
    }
}
