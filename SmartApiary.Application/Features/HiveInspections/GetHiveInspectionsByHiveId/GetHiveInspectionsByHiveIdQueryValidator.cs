using FluentValidation;

namespace SmartApiary.Application.Features.HiveInspections.GetHiveInspectionsByHiveId;

public sealed class GetHiveInspectionsByHiveIdQueryValidator
    : AbstractValidator<GetHiveInspectionsByHiveIdQuery>
{
    public GetHiveInspectionsByHiveIdQueryValidator()
    {
        RuleFor(query => query.HiveId)
            .NotEmpty();
    }
}
