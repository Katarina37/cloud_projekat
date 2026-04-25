using FluentValidation;

namespace SmartApiary.Application.Features.Hives.DeleteHive;

public sealed class DeleteHiveCommandValidator : AbstractValidator<DeleteHiveCommand>
{
    public DeleteHiveCommandValidator()
    {
        RuleFor(command => command.HiveId)
            .NotEmpty();
    }
}
