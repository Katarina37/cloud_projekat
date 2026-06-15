// Provera podataka pre nego sto aktiviramo korisnicki nalog.

using FluentValidation;

namespace SmartApiary.Application.Features.Auth.ActivateAccount;

public sealed class ActivateAccountCommandValidator : AbstractValidator<ActivateAccountCommand>
{
    public ActivateAccountCommandValidator()
    {
        RuleFor(command => command.Token)
            .NotEmpty();

        RuleFor(command => command.Password)
            .NotEmpty()
            .MinimumLength(8);

        RuleFor(command => command.ConfirmPassword)
            .Equal(command => command.Password)
            .WithMessage("Passwords do not match.");
    }
}
