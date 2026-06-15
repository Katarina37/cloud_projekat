// Provera podataka pre nego sto trazimo uredjaj povezan sa kosnicom.

using FluentValidation;

namespace SmartApiary.Application.Features.Devices.GetDeviceByHive;

public sealed class GetDeviceByHiveQueryValidator : AbstractValidator<GetDeviceByHiveQuery>
{
    public GetDeviceByHiveQueryValidator()
    {
        RuleFor(query => query.HiveId)
            .NotEmpty();
    }
}
