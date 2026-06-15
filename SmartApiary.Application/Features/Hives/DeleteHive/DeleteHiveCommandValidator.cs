// Provera podataka pre nego sto brisemo kosnicu.

using FluentValidation;

namespace SmartApiary.Application.Features.Hives.DeleteHive;

public sealed class DeleteHiveCommandValidator : AbstractValidator<DeleteHiveCommand>
{
    public DeleteHiveCommandValidator()
    {
        RuleFor(command => command.HiveId)
            .NotEmpty();
    }
}
