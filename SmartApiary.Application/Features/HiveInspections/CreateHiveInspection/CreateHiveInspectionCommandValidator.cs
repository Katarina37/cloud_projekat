using FluentValidation;

namespace SmartApiary.Application.Features.HiveInspections.CreateHiveInspection;

public sealed class CreateHiveInspectionCommandValidator : AbstractValidator<CreateHiveInspectionCommand>
{
    public CreateHiveInspectionCommandValidator()
    {
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
