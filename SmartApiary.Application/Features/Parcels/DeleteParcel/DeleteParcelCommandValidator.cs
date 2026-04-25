using FluentValidation;

namespace SmartApiary.Application.Features.Parcels.DeleteParcel;

public sealed class DeleteParcelCommandValidator : AbstractValidator<DeleteParcelCommand>
{
    public DeleteParcelCommandValidator()
    {
        RuleFor(command => command.ParcelId)
            .NotEmpty();
    }
}
