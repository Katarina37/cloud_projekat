using SmartApiary.Domain.Enums;

namespace SmartApiary.Domain.Models;

public class User
{
    private User()
    {
        FirstName = string.Empty;
        LastName = string.Empty;
        Email = string.Empty;
        PhoneNumber = string.Empty;
    }

    public User(
        string firstName,
        string lastName,
        string email,
        string phoneNumber,
        UserRole role)
    {
        Id = Guid.NewGuid();
        FirstName = RequireNotEmpty(firstName, nameof(firstName));
        LastName = RequireNotEmpty(lastName, nameof(lastName));
        Email = RequireNotEmpty(email, nameof(email));
        PhoneNumber = RequireNotEmpty(phoneNumber, nameof(phoneNumber));
        Role = role;
        IsActive = false;
        CreatedAt = DateTime.UtcNow;
    }

    public Guid Id { get; private set; }

    public string FirstName { get; private set; }

    public string LastName { get; private set; }

    public string Email { get; private set; }

    public string PhoneNumber { get; private set; }

    public UserRole Role { get; private set; }

    public bool IsActive { get; private set; }

    public string? PasswordHash { get; private set; }

    public string? ActivationToken { get; private set; }

    public DateTime? ActivationTokenExpiresAt { get; private set; }

    public string? PasswordResetToken { get; private set; }

    public DateTime? PasswordResetTokenExpiresAt { get; private set; }

    public DateTime CreatedAt { get; private set; }

    public void SetActivationToken(string token, DateTime expiresAt)
    {
        ActivationToken = RequireNotEmpty(token, nameof(token));
        ActivationTokenExpiresAt = expiresAt;
        IsActive = false;
    }

    public void Activate(string passwordHash)
    {
        PasswordHash = RequireNotEmpty(passwordHash, nameof(passwordHash));
        IsActive = true;
        ActivationToken = null;
        ActivationTokenExpiresAt = null;
        PasswordResetToken = null;
        PasswordResetTokenExpiresAt = null;
    }

    public void SetPasswordResetToken(string token, DateTime expiresAt)
    {
        PasswordResetToken = RequireNotEmpty(token, nameof(token));
        PasswordResetTokenExpiresAt = expiresAt;
    }

    public void ResetPassword(string passwordHash)
    {
        PasswordHash = RequireNotEmpty(passwordHash, nameof(passwordHash));
        PasswordResetToken = null;
        PasswordResetTokenExpiresAt = null;
    }

    public void Deactivate()
    {
        IsActive = false;
        ActivationToken = null;
        ActivationTokenExpiresAt = null;
        PasswordResetToken = null;
        PasswordResetTokenExpiresAt = null;
    }

    public void ChangeContactInfo(string email, string phoneNumber)
    {
        Email = RequireNotEmpty(email, nameof(email));
        PhoneNumber = RequireNotEmpty(phoneNumber, nameof(phoneNumber));
    }

    private static string RequireNotEmpty(string value, string parameterName)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new ArgumentException("Value cannot be empty.", parameterName);
        }

        return value;
    }
}
