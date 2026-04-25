using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Domain.Models;

public class Apiary
{
    public Apiary(
        Guid beekeeperId,
        string name,
        GeoLocation location,
        string? terrainDescription = null,
        string? imageUrl = null,
        string? thumbnailUrl = null)
    {
        if (beekeeperId == Guid.Empty)
        {
            throw new ArgumentException("Beekeeper id cannot be empty.", nameof(beekeeperId));
        }

        Id = Guid.NewGuid();
        BeekeeperId = beekeeperId;
        Name = RequireNotEmpty(name, nameof(name));
        Location = location ?? throw new ArgumentNullException(nameof(location));
        TerrainDescription = terrainDescription;
        ImageUrl = imageUrl;
        ThumbnailUrl = thumbnailUrl;
        CreatedAt = DateTime.UtcNow;
    }

    public Guid Id { get; private set; }

    public Guid BeekeeperId { get; private set; }

    public string Name { get; private set; }

    public GeoLocation Location { get; private set; }

    public string? TerrainDescription { get; private set; }

    public string? ImageUrl { get; private set; }

    public string? ThumbnailUrl { get; private set; }

    public DateTime CreatedAt { get; private set; }

    public void UpdateDetails(string name, GeoLocation location, string? terrainDescription)
    {
        Name = RequireNotEmpty(name, nameof(name));
        Location = location ?? throw new ArgumentNullException(nameof(location));
        TerrainDescription = terrainDescription;
    }

    public void UpdateImages(string? imageUrl, string? thumbnailUrl)
    {
        ImageUrl = imageUrl;
        ThumbnailUrl = thumbnailUrl;
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
