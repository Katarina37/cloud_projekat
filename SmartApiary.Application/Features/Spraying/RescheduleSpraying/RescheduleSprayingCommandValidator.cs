// Provera podataka pre nego sto pomeramo termin prskanja.

using FluentValidation;

namespace SmartApiary.Application.Features.Spraying.RescheduleSpraying;

public sealed class RescheduleSprayingCommandValidator : AbstractValidator<RescheduleSprayingCommand>
{
    public RescheduleSprayingCommandValidator()
    {
        RuleFor(command => command.SprayingAnnouncementId)
            .NotEmpty();

        RuleFor(command => command.NewStartTime)
            .NotEqual(default(DateTime));

        RuleFor(command => command.NewDurationHours)
            .GreaterThan(0);
    }
}
