// Provera podataka pre nego sto ucitavamo kulture sa parcele.

using FluentValidation;

namespace SmartApiary.Application.Features.Crops.GetCropsByParcel;

public sealed class GetCropsByParcelQueryValidator : AbstractValidator<GetCropsByParcelQuery>
{
    public GetCropsByParcelQueryValidator()
    {
        RuleFor(query => query.ParcelId)
            .NotEmpty();
    }
}
