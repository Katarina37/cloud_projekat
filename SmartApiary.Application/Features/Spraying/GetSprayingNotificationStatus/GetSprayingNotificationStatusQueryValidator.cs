using FluentValidation;

namespace SmartApiary.Application.Features.Spraying.GetSprayingNotificationStatus;

public sealed class GetSprayingNotificationStatusQueryValidator
    : AbstractValidator<GetSprayingNotificationStatusQuery>
{
    public GetSprayingNotificationStatusQueryValidator()
    {
        RuleFor(query => query.SprayingAnnouncementId)
            .NotEmpty();
    }
}
