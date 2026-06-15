// Provera podataka pre nego sto ucitavamo poslednje stanje kosnice.

using FluentValidation;

namespace SmartApiary.Application.Features.Telemetry.GetLatestHiveStatus;

public sealed class GetLatestHiveStatusQueryValidator : AbstractValidator<GetLatestHiveStatusQuery>
{
    public GetLatestHiveStatusQueryValidator()
    {
        RuleFor(query => query.HiveId)
            .NotEmpty();
    }
}
