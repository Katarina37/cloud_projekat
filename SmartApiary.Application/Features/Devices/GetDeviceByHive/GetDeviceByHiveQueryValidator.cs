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
