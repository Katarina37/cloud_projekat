// Provera podataka pre nego sto brisemo pcelinjak.

using FluentValidation;

namespace SmartApiary.Application.Features.Apiaries.DeleteApiary;

public sealed class DeleteApiaryCommandValidator : AbstractValidator<DeleteApiaryCommand>
{
    public DeleteApiaryCommandValidator()
    {
        RuleFor(command => command.ApiaryId)
            .NotEmpty();
    }
}
