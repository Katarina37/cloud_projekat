using FluentValidation;

namespace SmartApiary.Application.Features.Parcels.UpdateParcel;

public sealed class UpdateParcelCommandValidator : AbstractValidator<UpdateParcelCommand>
{
    public UpdateParcelCommandValidator()
    {
        RuleFor(command => command.ParcelId)
            .NotEmpty();

        RuleFor(command => command.Name)
            .NotEmpty();

        RuleFor(command => command.Latitude)
            .InclusiveBetween(-90, 90);

        RuleFor(command => command.Longitude)
            .InclusiveBetween(-180, 180);
    }
}
