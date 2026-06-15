// Provera podataka pre nego sto dodajemo parcelu.

using FluentValidation;

namespace SmartApiary.Application.Features.Parcels.CreateParcel;

public sealed class CreateParcelCommandValidator : AbstractValidator<CreateParcelCommand>
{
    public CreateParcelCommandValidator()
    {
        RuleFor(command => command.Name)
            .NotEmpty();

        RuleFor(command => command.Latitude)
            .InclusiveBetween(-90, 90);

        RuleFor(command => command.Longitude)
            .InclusiveBetween(-180, 180);
    }
}
