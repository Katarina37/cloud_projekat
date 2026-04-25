using FluentValidation;

namespace SmartApiary.Application.Features.Telemetry.GetTelemetryForHive;

public sealed class GetTelemetryForHiveQueryValidator : AbstractValidator<GetTelemetryForHiveQuery>
{
    public GetTelemetryForHiveQueryValidator()
    {
        RuleFor(query => query.HiveId)
            .NotEmpty();

        RuleFor(query => query.To)
            .GreaterThanOrEqualTo(query => query.From);
    }
}
