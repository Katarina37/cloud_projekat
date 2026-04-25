using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Domain.Models;

public class Parcel
{
    private Parcel()
    {
        Name = null!;
        Location = null!;
    }

    public Parcel(Guid farmerId, string name, GeoLocation location)
    {
        if (farmerId == Guid.Empty)
        {
            throw new ArgumentException("Farmer id cannot be empty.", nameof(farmerId));
        }

        Id = Guid.NewGuid();
        FarmerId = farmerId;
        Name = RequireNotEmpty(name, nameof(name));
        Location = location ?? throw new ArgumentNullException(nameof(location));
        CreatedAt = DateTime.UtcNow;
    }

    public Guid Id { get; private set; }

    public Guid FarmerId { get; private set; }

    public string Name { get; private set; }

    public GeoLocation Location { get; private set; }

    public DateTime CreatedAt { get; private set; }

    public void UpdateDetails(string name, GeoLocation location)
    {
        Name = RequireNotEmpty(name, nameof(name));
        Location = location ?? throw new ArgumentNullException(nameof(location));
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
