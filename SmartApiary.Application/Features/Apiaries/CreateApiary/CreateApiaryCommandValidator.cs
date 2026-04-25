using FluentValidation;

namespace SmartApiary.Application.Features.Apiaries.CreateApiary;

public sealed class CreateApiaryCommandValidator : AbstractValidator<CreateApiaryCommand>
{
    public CreateApiaryCommandValidator()
    {
        RuleFor(command => command.Name)
            .NotEmpty();

        RuleFor(command => command.Latitude)
            .InclusiveBetween(-90, 90);

        RuleFor(command => command.Longitude)
            .InclusiveBetween(-180, 180);
    }
}
