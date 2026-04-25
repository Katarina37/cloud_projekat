using FluentValidation;

namespace SmartApiary.Application.Features.Hives.CreateHive;

public sealed class CreateHiveCommandValidator : AbstractValidator<CreateHiveCommand>
{
    public CreateHiveCommandValidator()
    {
        RuleFor(command => command.ApiaryId)
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
