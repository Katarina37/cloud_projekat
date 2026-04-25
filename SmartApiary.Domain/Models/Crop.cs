namespace SmartApiary.Domain.Models;

public class Crop
{
    public Crop(
        Guid parcelId,
        string name,
        DateTime expectedBloomingStart,
        DateTime expectedBloomingEnd,
        double? area = null,
        string? notes = null)
    {
        if (parcelId == Guid.Empty)
        {
            throw new ArgumentException("Parcel id cannot be empty.", nameof(parcelId));
        }

        Id = Guid.NewGuid();
        ParcelId = parcelId;
        Name = RequireNotEmpty(name, nameof(name));
        ExpectedBloomingStart = expectedBloomingStart;
        ExpectedBloomingEnd = RequireValidBloomingEnd(expectedBloomingStart, expectedBloomingEnd);
        Area = RequireValidArea(area);
        Notes = notes;
    }

    public Guid Id { get; private set; }

    public Guid ParcelId { get; private set; }

    public string Name { get; private set; }

    public DateTime ExpectedBloomingStart { get; private set; }

    public DateTime ExpectedBloomingEnd { get; private set; }

    public double? Area { get; private set; }

    public string? Notes { get; private set; }

    public void UpdateDetails(
        string name,
        DateTime expectedBloomingStart,
        DateTime expectedBloomingEnd,
        double? area,
        string? notes)
    {
        Name = RequireNotEmpty(name, nameof(name));
        ExpectedBloomingStart = expectedBloomingStart;
        ExpectedBloomingEnd = RequireValidBloomingEnd(expectedBloomingStart, expectedBloomingEnd);
        Area = RequireValidArea(area);
        Notes = notes;
    }

    private static string RequireNotEmpty(string value, string parameterName)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new ArgumentException("Value cannot be empty.", parameterName);
        }

        return value;
    }

    private static DateTime RequireValidBloomingEnd(DateTime expectedBloomingStart, DateTime expectedBloomingEnd)
    {
        if (expectedBloomingEnd < expectedBloomingStart)
        {
            throw new ArgumentException(
                "Expected blooming end cannot be before expected blooming start.",
                nameof(expectedBloomingEnd));
        }

        return expectedBloomingEnd;
    }

    private static double? RequireValidArea(double? area)
    {
        if (area < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(area), "Area cannot be negative.");
        }

        return area;
    }
}
