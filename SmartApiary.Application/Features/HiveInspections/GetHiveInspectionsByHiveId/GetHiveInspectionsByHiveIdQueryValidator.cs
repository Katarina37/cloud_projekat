// Provera podataka pre nego sto ucitavamo preglede kosnice.

using FluentValidation;

namespace SmartApiary.Application.Features.HiveInspections.GetHiveInspectionsByHiveId;

public sealed class GetHiveInspectionsByHiveIdQueryValidator
    : AbstractValidator<GetHiveInspectionsByHiveIdQuery>
{
    public GetHiveInspectionsByHiveIdQueryValidator()
    {
        RuleFor(query => query.HiveId)
            .NotEmpty();

        RuleFor(query => query.PageNumber)
            .GreaterThanOrEqualTo(1);

        RuleFor(query => query.PageSize)
            .GreaterThan(0)
            .LessThanOrEqualTo(50);
    }
}
