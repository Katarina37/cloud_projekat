using FluentValidation;

namespace SmartApiary.Application.Features.Spraying.CompleteSpraying;

public sealed class CompleteSprayingCommandValidator : AbstractValidator<CompleteSprayingCommand>
{
    public CompleteSprayingCommandValidator()
    {
        RuleFor(command => command.SprayingAnnouncementId)
            .NotEmpty()
            .WithMessage("Spraying announcement id is required.");

        RuleFor(command => command.ActualStartTime)
            .NotNull()
            .WithMessage("Actual start time is required.");

        RuleFor(command => command.ActualEndTime)
            .NotNull()
            .WithMessage("Actual end time is required.")
            .GreaterThan(command => command.ActualStartTime)
            .When(command => command.ActualStartTime.HasValue && command.ActualEndTime.HasValue)
            .WithMessage("Actual end time must be after actual start time.");

        RuleFor(command => command.CropId)
            .NotEmpty()
            .WithMessage("Crop is required.");

        RuleFor(command => command.Note)
            .MaximumLength(1000)
            .WithMessage("Note cannot be longer than 1000 characters.");
    }
}
