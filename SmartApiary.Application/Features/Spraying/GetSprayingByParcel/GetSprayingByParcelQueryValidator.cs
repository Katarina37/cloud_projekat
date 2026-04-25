using FluentValidation;

namespace SmartApiary.Application.Features.Spraying.GetSprayingByParcel;

public sealed class GetSprayingByParcelQueryValidator : AbstractValidator<GetSprayingByParcelQuery>
{
    public GetSprayingByParcelQueryValidator()
    {
        RuleFor(query => query.ParcelId)
            .NotEmpty();
    }
}
