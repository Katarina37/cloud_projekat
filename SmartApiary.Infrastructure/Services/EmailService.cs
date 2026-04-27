using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using SmartApiary.Application.Interfaces.Services;

namespace SmartApiary.Infrastructure.Services;

public sealed class EmailService : IEmailService
{
    private readonly ILogger<EmailService> _logger;
    private readonly string _frontendBaseUrl;

    public EmailService(
        ILogger<EmailService> logger,
        IConfiguration configuration)
    {
        _logger = logger;
        _frontendBaseUrl = (configuration["Frontend:BaseUrl"] ?? "http://localhost:5173")
            .TrimEnd('/');
    }

    public Task SendActivationEmailAsync(
        string to,
        string firstName,
        string activationToken,
        CancellationToken cancellationToken = default)
    {
        var activationLink = BuildFrontendUrl("activate", activationToken);
        var body = $"""
            Hello {firstName},

            Your SmartApiary account has been created.
            Activate it by opening: {activationLink}
            """;

        return SendAsync(to, "SmartApiary account activation", body, cancellationToken);
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
        _logger.LogInformation(
            "Email placeholder to {To}. Subject: {Subject}. Body: {Body}",
            to,
            subject,
            body);

        return Task.CompletedTask;
    }
}
