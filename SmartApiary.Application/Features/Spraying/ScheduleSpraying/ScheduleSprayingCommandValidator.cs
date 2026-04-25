using FluentValidation;

namespace SmartApiary.Application.Features.Spraying.ScheduleSpraying;

public sealed class ScheduleSprayingCommandValidator : AbstractValidator<ScheduleSprayingCommand>
{
    public ScheduleSprayingCommandValidator()
    {
        RuleFor(command => command.ParcelId)
            .NotEmpty();

        RuleFor(command => command.StartTime)
            .NotEqual(default(DateTime));

        RuleFor(command => command.DurationHours)
            .GreaterThan(0);
    }
}
