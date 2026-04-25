namespace SmartApiary.Domain.Models;

public class HiveInspectionRecord
{
    public HiveInspectionRecord(
        Guid hiveId,
        DateTime inspectionDateTime,
        string bottomBoardColor,
        int honeyFramesCount,
        double honeyAmountKg,
        int broodFramesCount,
        bool queenPresent,
        string? notes = null)
    {
        if (hiveId == Guid.Empty)
        {
            throw new ArgumentException("Hive id cannot be empty.", nameof(hiveId));
        }

        Id = Guid.NewGuid();
        HiveId = hiveId;
        InspectionDateTime = inspectionDateTime;
        BottomBoardColor = RequireNotEmpty(bottomBoardColor, nameof(bottomBoardColor));
        HoneyFramesCount = RequireNonNegative(honeyFramesCount, nameof(honeyFramesCount));
        HoneyAmountKg = RequireNonNegative(honeyAmountKg, nameof(honeyAmountKg));
        BroodFramesCount = RequireNonNegative(broodFramesCount, nameof(broodFramesCount));
        QueenPresent = queenPresent;
        Notes = notes;
    }

    public Guid Id { get; private set; }

    public Guid HiveId { get; private set; }

    public DateTime InspectionDateTime { get; private set; }

    public string BottomBoardColor { get; private set; }

    public int HoneyFramesCount { get; private set; }

    public double HoneyAmountKg { get; private set; }

    public int BroodFramesCount { get; private set; }

    public bool QueenPresent { get; private set; }

    public string? Notes { get; private set; }

    public void UpdateDetails(
        DateTime inspectionDateTime,
        string bottomBoardColor,
        int honeyFramesCount,
        double honeyAmountKg,
        int broodFramesCount,
        bool queenPresent,
        string? notes)
    {
        InspectionDateTime = inspectionDateTime;
        BottomBoardColor = RequireNotEmpty(bottomBoardColor, nameof(bottomBoardColor));
        HoneyFramesCount = RequireNonNegative(honeyFramesCount, nameof(honeyFramesCount));
        HoneyAmountKg = RequireNonNegative(honeyAmountKg, nameof(honeyAmountKg));
        BroodFramesCount = RequireNonNegative(broodFramesCount, nameof(broodFramesCount));
        QueenPresent = queenPresent;
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

    private static int RequireNonNegative(int value, string parameterName)
    {
        if (value < 0)
        {
            throw new ArgumentOutOfRangeException(parameterName, "Value cannot be negative.");
        }

        return value;
    }

    private static double RequireNonNegative(double value, string parameterName)
    {
        if (value < 0)
        {
            throw new ArgumentOutOfRangeException(parameterName, "Value cannot be negative.");
        }

        return value;
    }
}
