using FluentValidation;

namespace SmartApiary.Application.Features.Spraying.CancelSpraying;

public sealed class CancelSprayingCommandValidator : AbstractValidator<CancelSprayingCommand>
{
    public CancelSprayingCommandValidator()
    {
        RuleFor(command => command.SprayingAnnouncementId)
            .NotEmpty();
    }
}
