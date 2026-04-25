using FluentValidation;

namespace SmartApiary.Application.Features.Apiaries.UpdateApiary;

public sealed class UpdateApiaryCommandValidator : AbstractValidator<UpdateApiaryCommand>
{
    public UpdateApiaryCommandValidator()
    {
        RuleFor(command => command.ApiaryId)
            .NotEmpty();

        RuleFor(command => command.Name)
            .NotEmpty();

        RuleFor(command => command.Latitude)
            .InclusiveBetween(-90, 90);

        RuleFor(command => command.Longitude)
            .InclusiveBetween(-180, 180);
    }
}
