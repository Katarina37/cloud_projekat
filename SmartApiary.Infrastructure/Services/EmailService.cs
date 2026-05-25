using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using SendGrid;
using SendGrid.Helpers.Mail;
using SmartApiary.Application.Interfaces.Services;

namespace SmartApiary.Infrastructure.Services;

public sealed class EmailService : IEmailService
{
    private readonly ILogger<EmailService> _logger;
    private readonly string _frontendBaseUrl;
    private readonly IConfiguration _configuration;
    private readonly string? _sendGridApiKey;

    public EmailService(
        ILogger<EmailService> logger,
        IConfiguration configuration)
    {
        _logger = logger;
        _configuration = configuration;
        _frontendBaseUrl = (configuration["Frontend:BaseUrl"] ?? "http://localhost:5173")
            .TrimEnd('/');
        _sendGridApiKey = configuration["SendGrid:ApiKey"];
    }

    public async Task SendActivationEmailAsync(
        string to,
        string firstName,
        string activationToken,
        CancellationToken cancellationToken = default)
    {
        var activationLink = BuildFrontendUrl("activate", activationToken);

        _logger.LogWarning(
            "Activation key for newly registered user {Email}: {ActivationKey}. Activation link: {ActivationLink}",
            to,
            activationToken,
            activationLink);

        var body = $"""
            Hello {firstName},

            Your SmartApiary account has been created.
            Activation key: {activationToken}
            Activate it by opening: {activationLink}
            """;

        try
        {
            await SendAsync(to, "SmartApiary account activation", body, cancellationToken);
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            throw;
        }
        catch (Exception exception)
        {
            _logger.LogError(
                exception,
                "Activation email could not be sent to {To}. The activation key for this newly registered user was logged before the send attempt.",
                to);
        }
    }

    public Task SendPasswordResetEmailAsync(
        string to,
        string passwordResetToken,
        CancellationToken cancellationToken = default)
    {
        var resetLink = BuildFrontendUrl("reset-password", passwordResetToken);
        var body = $"""
            A SmartApiary password reset was requested.
            Reset the password by opening: {resetLink}
            """;

        return SendAsync(to, "SmartApiary password reset", body, cancellationToken);
    }

    public Task SendNotificationEmailAsync(
        string to,
        string subject,
        string body,
        CancellationToken cancellationToken = default)
    {
        return SendAsync(to, subject, body, cancellationToken);
    }

    private string BuildFrontendUrl(string path, string token)
    {
        return $"{_frontendBaseUrl}/{path}?token={Uri.EscapeDataString(token)}";
    }

    private async Task SendAsync(
        string to,
        string subject,
        string body,
        CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var fromAddress = _configuration["Email:FromAddress"];
        var fromName = _configuration["Email:FromName"] ?? "SmartApiary";

        if (string.IsNullOrWhiteSpace(_sendGridApiKey)
            || string.IsNullOrWhiteSpace(fromAddress))
        {
            _logger.LogInformation(
                "SendGrid is not configured. Placeholder email to {To}. Subject: {Subject}. Body: {Body}",
                to,
                subject,
                body);
            return;
        }

        var client = new SendGridClient(_sendGridApiKey);
        var message = new SendGridMessage
        {
            From = new EmailAddress(fromAddress, fromName),
            Subject = subject,
            PlainTextContent = body
        };
        message.AddTo(new EmailAddress(to));

        var response = await client.SendEmailAsync(message, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            _logger.LogWarning(
                "SendGrid returned status {StatusCode} for email to {To}.",
                response.StatusCode,
                to);
        }
    }
}
