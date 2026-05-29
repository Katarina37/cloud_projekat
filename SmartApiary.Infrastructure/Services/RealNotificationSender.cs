using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Application.Interfaces.Services;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.Models;

namespace SmartApiary.Infrastructure.Services;

public sealed class RealNotificationSender : INotificationSender
{
    private const double NotificationRadiusKm = 5d;

    private readonly IUserRepository _userRepository;
    private readonly IApiaryRepository _apiaryRepository;
    private readonly INotificationRepository _notificationRepository;
    private readonly IEmailService _emailService;
    private readonly ILogger<RealNotificationSender> _logger;

    public RealNotificationSender(
        IUserRepository userRepository,
        IApiaryRepository apiaryRepository,
        INotificationRepository notificationRepository,
        IEmailService emailService,
        ILogger<RealNotificationSender> logger)
    {
        _userRepository = userRepository;
        _apiaryRepository = apiaryRepository;
        _notificationRepository = notificationRepository;
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
            var notification = new Notification(userId, MapEventToType(title), title, message);
            await _notificationRepository.AddAsync(notification, cancellationToken);

            await _emailService.SendNotificationEmailAsync(user.Email, title, message, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send notification to user {UserId}", userId);
        }
    }

    public async Task SendToApiaryGroupAsync(Guid apiaryId, string eventName, object payload, CancellationToken cancellationToken = default)
    {
        var apiary = await _apiaryRepository.GetByIdAsync(apiaryId, cancellationToken);
        if (apiary is null)
        {
            _logger.LogDebug("SendToApiaryGroupAsync: apiary not found {ApiaryId}", apiaryId);
            return;
        }

        var nearbyApiaries = await _apiaryRepository.FindWithinRadiusAsync(apiary.Location, NotificationRadiusKm, cancellationToken);

        var beekeeperIds = nearbyApiaries.Select(a => a.BeekeeperId).Distinct().ToList();

        var title = BuildTitleFromEvent(apiary, eventName);
        var message = payload?.ToString() ?? eventName;

        foreach (var beekeeperId in beekeeperIds)
        {
            try
            {
                var user = await _userRepository.GetByIdAsync(beekeeperId, cancellationToken);
                if (user is null || string.IsNullOrWhiteSpace(user.Email))
                {
                    continue;
                }

                var notification = new Notification(user.Id, MapEventToType(eventName), title, message);
                await _notificationRepository.AddAsync(notification, cancellationToken);

                await _emailService.SendNotificationEmailAsync(user.Email, title, message, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send group notification to beekeeper {BeekeeperId}", beekeeperId);
            }
        }
    }

    private static NotificationType MapEventToType(string eventName)
    {
        if (string.IsNullOrWhiteSpace(eventName))
        {
            return NotificationType.PesticideWarning;
        }

        var lowered = eventName.ToLowerInvariant();
        if (lowered.Contains("spray") || lowered.Contains("spraying"))
        {
            return NotificationType.SprayingChanged;
        }

        if (lowered.Contains("pesticide"))
        {
            return NotificationType.PesticideWarning;
        }

        if (lowered.Contains("battery"))
        {
            return NotificationType.BatteryLow;
        }

        if (lowered.Contains("weight") || lowered.Contains("drop"))
        {
            return NotificationType.WeightDrop;
        }

        return NotificationType.PesticideWarning;
    }

    private static string BuildTitleFromEvent(Domain.Models.Apiary apiary, string eventName)
    {
        var namePart = string.IsNullOrWhiteSpace(apiary.Name) ? apiary.Id.ToString() : apiary.Name;
        return $"{eventName} — Apiary: {namePart}";
    }
}
