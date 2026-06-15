// Provera podataka pre nego sto brisemo korisnika.

using FluentValidation;

namespace SmartApiary.Application.Features.Admin.Users.DeleteUser;

public sealed class DeleteUserCommandValidator : AbstractValidator<DeleteUserCommand>
{
    public DeleteUserCommandValidator()
    {
        RuleFor(command => command.UserId)
            .NotEmpty();
    }
}
