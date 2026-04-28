using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using SmartApiary.Application.Interfaces.Services;
using System.Net;
using System.Net.Mail;

namespace SmartApiary.Infrastructure.Services;

public sealed class EmailService : IEmailService
{
    private readonly ILogger<EmailService> _logger;
    private readonly string _frontendBaseUrl;
    private readonly IConfiguration _configuration;

    public EmailService(
        ILogger<EmailService> logger,
        IConfiguration configuration)
    {
        _logger = logger;
        _configuration = configuration;
        _frontendBaseUrl = (configuration["Frontend:BaseUrl"] ?? "http://localhost:5173")
            .TrimEnd('/');
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

    private string BuildFrontendUrl(string path, string token)
    {
        return $"{_frontendBaseUrl}/{path}?token={Uri.EscapeDataString(token)}";
    }

    private Task SendAsync(
        string to,
        string subject,
        string body,
        CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var smtpHost = _configuration["Email:Smtp:Host"];
        var fromAddress = _configuration["Email:FromAddress"];
        if (!string.IsNullOrWhiteSpace(smtpHost) && !string.IsNullOrWhiteSpace(fromAddress))
        {
            return SendSmtpAsync(to, subject, body, smtpHost, fromAddress, cancellationToken);
        }

        _logger.LogInformation(
            "Email SMTP is not configured. Development placeholder to {To}. Subject: {Subject}. Body: {Body}",
            to,
            subject,
            body);

        return Task.CompletedTask;
    }

    private async Task SendSmtpAsync(
        string to,
        string subject,
        string body,
        string smtpHost,
        string fromAddress,
        CancellationToken cancellationToken)
    {
        var smtpPort = _configuration.GetValue("Email:Smtp:Port", 25);
        var enableSsl = _configuration.GetValue("Email:Smtp:EnableSsl", false);
        var username = _configuration["Email:Smtp:Username"];
        var password = _configuration["Email:Smtp:Password"];
        var fromName = _configuration["Email:FromName"] ?? "SmartApiary";

        using var message = new MailMessage
        {
            From = new MailAddress(fromAddress, fromName),
            Subject = subject,
            Body = body
        };
        message.To.Add(to);

        using var client = new SmtpClient(smtpHost, smtpPort)
        {
            EnableSsl = enableSsl
        };

        if (!string.IsNullOrWhiteSpace(username))
        {
            client.Credentials = new NetworkCredential(username, password);
        }

        await client.SendMailAsync(message, cancellationToken);
    }
}
