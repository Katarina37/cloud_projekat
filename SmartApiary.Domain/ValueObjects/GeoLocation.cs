// GeoLocation drzi povezane vrednosti i njihove provere na jednom mestu.

namespace SmartApiary.Domain.ValueObjects;

public sealed class GeoLocation : IEquatable<GeoLocation>
{
    public GeoLocation(double latitude, double longitude)
    {
        if (latitude is < -90 or > 90)
        {
            throw new ArgumentOutOfRangeException(nameof(latitude), "Latitude must be in range [-90, 90].");
        }

        if (longitude is < -180 or > 180)
        {
            throw new ArgumentOutOfRangeException(nameof(longitude), "Longitude must be in range [-180, 180].");
        }

        Latitude = latitude;
        Longitude = longitude;
    }

    public double Latitude { get; }

    public double Longitude { get; }

    public bool Equals(GeoLocation? other)
    {
        return other is not null
            && Latitude.Equals(other.Latitude)
            && Longitude.Equals(other.Longitude);
    }

    public override bool Equals(object? obj)
    {
        return Equals(obj as GeoLocation);
    }

    public override int GetHashCode()
    {
        return HashCode.Combine(Latitude, Longitude);
    }

    public static bool operator ==(GeoLocation? left, GeoLocation? right)
    {
        return EqualityComparer<GeoLocation>.Default.Equals(left, right);
    }

    public static bool operator !=(GeoLocation? left, GeoLocation? right)
    {
        return !(left == right);
    }
}
