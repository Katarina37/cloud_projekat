using FluentValidation;
using SmartApiary.Domain.Enums;

namespace SmartApiary.Application.Features.Admin.Users.CreateUser;

public sealed class CreateUserCommandValidator : AbstractValidator<CreateUserCommand>
{
    public CreateUserCommandValidator()
    {
        RuleFor(command => command.FirstName)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(command => command.LastName)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(command => command.Email)
            .NotEmpty()
            .EmailAddress()
            .MaximumLength(256);

        RuleFor(command => command.PhoneNumber)
            .NotEmpty()
            .MaximumLength(32);

        RuleFor(command => command.Role)
            .IsInEnum()
            .Must(role => role is UserRole.Beekeeper or UserRole.Farmer)
            .WithMessage("Admin can create only Beekeeper or Farmer accounts.");
    }
}
