// Provera podataka pre nego sto deaktiviramo korisnika.

using FluentValidation;

namespace SmartApiary.Application.Features.Admin.Users.DeactivateUser;

public sealed class DeactivateUserCommandValidator : AbstractValidator<DeactivateUserCommand>
{
    public DeactivateUserCommandValidator()
    {
        RuleFor(command => command.UserId)
            .NotEmpty();
    }
}
