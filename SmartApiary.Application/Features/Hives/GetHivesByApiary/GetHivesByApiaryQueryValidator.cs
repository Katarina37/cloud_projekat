// Provera podataka pre nego sto ucitavamo kosnice iz pcelinjaka.

using FluentValidation;

namespace SmartApiary.Application.Features.Hives.GetHivesByApiary;

public sealed class GetHivesByApiaryQueryValidator : AbstractValidator<GetHivesByApiaryQuery>
{
    public GetHivesByApiaryQueryValidator()
    {
        RuleFor(query => query.ApiaryId)
            .NotEmpty();
    }
}
