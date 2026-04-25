using SmartApiary.Domain.Enums;

namespace SmartApiary.Domain.Models;

public class Hive
{
    public Hive(
        Guid apiaryId,
        string label,
        HiveType type,
        string boxColor,
        int queenAgeYears,
        string? notes = null)
    {
        if (apiaryId == Guid.Empty)
        {
            throw new ArgumentException("Apiary id cannot be empty.", nameof(apiaryId));
        }

        Id = Guid.NewGuid();
        ApiaryId = apiaryId;
        Label = RequireNotEmpty(label, nameof(label));
        Type = type;
        BoxColor = RequireNotEmpty(boxColor, nameof(boxColor));
        QueenAgeYears = RequireValidQueenAge(queenAgeYears);
        Notes = notes;
        CreatedAt = DateTime.UtcNow;
    }

    public Guid Id { get; private set; }

    public Guid ApiaryId { get; private set; }

    public string Label { get; private set; }

    public HiveType Type { get; private set; }

    public string BoxColor { get; private set; }

    public int QueenAgeYears { get; private set; }

    public string? Notes { get; private set; }

    public DateTime CreatedAt { get; private set; }

    public void UpdateDetails(
        string label,
        HiveType type,
        string boxColor,
        int queenAgeYears,
        string? notes)
    {
        Label = RequireNotEmpty(label, nameof(label));
        Type = type;
        BoxColor = RequireNotEmpty(boxColor, nameof(boxColor));
        QueenAgeYears = RequireValidQueenAge(queenAgeYears);
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

    private static int RequireValidQueenAge(int queenAgeYears)
    {
        if (queenAgeYears < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(queenAgeYears), "Queen age cannot be negative.");
        }

        return queenAgeYears;
    }
}
