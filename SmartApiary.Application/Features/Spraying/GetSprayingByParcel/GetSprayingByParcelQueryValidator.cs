using FluentValidation;

namespace SmartApiary.Application.Features.Spraying.GetSprayingByParcel;

public sealed class GetSprayingByParcelQueryValidator : AbstractValidator<GetSprayingByParcelQuery>
{
    public GetSprayingByParcelQueryValidator()
    {
        RuleFor(query => query.ParcelId)
            .NotEmpty();

        RuleFor(query => query.PageNumber)
            .GreaterThanOrEqualTo(1);

        RuleFor(query => query.PageSize)
            .GreaterThan(0)
            .LessThanOrEqualTo(50);
    }
}
