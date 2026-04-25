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
