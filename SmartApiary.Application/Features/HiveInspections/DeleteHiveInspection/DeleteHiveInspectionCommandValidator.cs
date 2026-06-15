// Provera podataka pre nego sto brisemo pregled kosnice.

using FluentValidation;

namespace SmartApiary.Application.Features.HiveInspections.DeleteHiveInspection;

public sealed class DeleteHiveInspectionCommandValidator : AbstractValidator<DeleteHiveInspectionCommand>
{
    public DeleteHiveInspectionCommandValidator()
    {
        RuleFor(command => command.Id)
            .NotEmpty();
    }
}
