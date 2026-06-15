// Konkretna implementacija servisa NoopNotificationSender.

using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Application.Interfaces.Services;

namespace SmartApiary.Infrastructure.Services;

public sealed class NoopNotificationSender : INotificationSender
{
    private readonly IUserRepository _userRepository;
    private readonly IEmailService _emailService;

    public NoopNotificationSender(IUserRepository userRepository, IEmailService emailService)
    {
        _userRepository = userRepository;
        _emailService = emailService;
    }

    public async Task SendToUserAsync(
        Guid userId,
        string title,
        string message,
        CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
        if (user is null || string.IsNullOrWhiteSpace(user.Email))
        {
            return;
        }

        await _emailService.SendNotificationEmailAsync(
            user.Email,
            title,
            message,
            cancellationToken);
    }
}
