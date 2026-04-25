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
