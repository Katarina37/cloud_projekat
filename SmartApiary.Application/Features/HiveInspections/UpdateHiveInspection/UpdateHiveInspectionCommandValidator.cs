// Provera podataka pre nego sto menjamo pregled kosnice.

using FluentValidation;

namespace SmartApiary.Application.Features.HiveInspections.UpdateHiveInspection;

public sealed class UpdateHiveInspectionCommandValidator : AbstractValidator<UpdateHiveInspectionCommand>
{
    public UpdateHiveInspectionCommandValidator()
    {
        RuleFor(command => command.Id)
            .NotEmpty();

        RuleFor(command => command.HiveId)
            .NotEmpty();

        RuleFor(command => command.Date)
            .NotEmpty();

        RuleFor(command => command.FramesWithHoney)
            .GreaterThanOrEqualTo(0);

        RuleFor(command => command.BroodFrames)
            .GreaterThanOrEqualTo(0);

        RuleFor(command => command.BottomBoardColor)
            .NotEmpty()
            .MaximumLength(50);

        RuleFor(command => command.HoneyQuantityKg)
            .GreaterThanOrEqualTo(0);

    }
}
