using FluentValidation;

namespace SmartApiary.Application.Features.Telemetry.GetDailyWeightDelta;

public sealed class GetDailyWeightDeltaQueryValidator : AbstractValidator<GetDailyWeightDeltaQuery>
{
    public GetDailyWeightDeltaQueryValidator()
    {
        RuleFor(query => query.HiveId)
            .NotEmpty();

        RuleFor(query => query.To)
            .GreaterThanOrEqualTo(query => query.From);
    }
}
