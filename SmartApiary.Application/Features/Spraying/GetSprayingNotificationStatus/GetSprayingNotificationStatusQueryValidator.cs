// Provera podataka pre nego sto proveravamo koliko je pcelara obavesteno.

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
