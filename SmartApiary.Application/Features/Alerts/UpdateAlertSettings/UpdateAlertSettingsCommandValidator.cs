using FluentValidation;

namespace SmartApiary.Application.Features.Alerts.UpdateAlertSettings;

public sealed class UpdateAlertSettingsCommandValidator : AbstractValidator<UpdateAlertSettingsCommand>
{
    public UpdateAlertSettingsCommandValidator()
    {
        RuleFor(command => command.WeightDropThresholdKg)
            .GreaterThan(0);
    }
}
