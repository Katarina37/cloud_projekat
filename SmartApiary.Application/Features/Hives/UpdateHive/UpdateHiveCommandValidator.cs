using FluentValidation;

namespace SmartApiary.Application.Features.Hives.UpdateHive;

public sealed class UpdateHiveCommandValidator : AbstractValidator<UpdateHiveCommand>
{
    public UpdateHiveCommandValidator()
    {
        RuleFor(command => command.HiveId)
            .NotEmpty();

        RuleFor(command => command.Label)
            .NotEmpty();

        RuleFor(command => command.Type)
            .IsInEnum();

        RuleFor(command => command.BoxColor)
            .NotEmpty();

        RuleFor(command => command.QueenAgeYears)
            .GreaterThanOrEqualTo(0);
    }
}
