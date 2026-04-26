using FluentValidation;

namespace SmartApiary.Application.Features.Notifications.MarkNotificationAsRead;

public sealed class MarkNotificationAsReadCommandValidator : AbstractValidator<MarkNotificationAsReadCommand>
{
    public MarkNotificationAsReadCommandValidator()
    {
        RuleFor(command => command.NotificationId)
            .NotEmpty();
    }
}
