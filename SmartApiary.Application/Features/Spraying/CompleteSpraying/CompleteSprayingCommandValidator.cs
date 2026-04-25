using FluentValidation;

namespace SmartApiary.Application.Features.Spraying.CompleteSpraying;

public sealed class CompleteSprayingCommandValidator : AbstractValidator<CompleteSprayingCommand>
{
    public CompleteSprayingCommandValidator()
    {
        RuleFor(command => command.SprayingAnnouncementId)
            .NotEmpty();
    }
}
