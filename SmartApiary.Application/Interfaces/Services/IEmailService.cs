namespace SmartApiary.Application.Interfaces.Services;

public interface IEmailService
{
    Task SendActivationEmailAsync(
        string to,
        string firstName,
        string activationToken,
        CancellationToken cancellationToken = default);

    Task SendPasswordResetEmailAsync(
        string to,
        string passwordResetToken,
        CancellationToken cancellationToken = default);
}
