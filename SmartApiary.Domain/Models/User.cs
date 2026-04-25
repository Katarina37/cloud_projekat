using SmartApiary.Domain.Enums;

namespace SmartApiary.Domain.Models;

public class User
{
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

    public DateTime CreatedAt { get; private set; }

    public void Activate()
    {
        IsActive = true;
    }

    public void Deactivate()
    {
        IsActive = false;
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
