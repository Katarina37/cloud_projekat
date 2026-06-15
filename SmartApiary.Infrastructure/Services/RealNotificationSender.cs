// Konkretna implementacija servisa RealNotificationSender.

using Microsoft.Extensions.Logging;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Application.Interfaces.Services;

namespace SmartApiary.Infrastructure.Services;

public sealed class RealNotificationSender : INotificationSender
{
    private readonly IUserRepository _userRepository;
    private readonly IEmailService _emailService;
    private readonly ILogger<RealNotificationSender> _logger;

    public RealNotificationSender(
        IUserRepository userRepository,
        IEmailService emailService,
        ILogger<RealNotificationSender> logger)
    {
        _userRepository = userRepository;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task SendToUserAsync(Guid userId, string title, string message, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
        if (user is null || string.IsNullOrWhiteSpace(user.Email))
        {
            _logger.LogDebug("SendToUserAsync: user not found or has no email: {UserId}", userId);
            return;
        }

        try
        {
            await _emailService.SendNotificationEmailAsync(user.Email, title, message, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send notification to user {UserId}", userId);
        }
    }
}
