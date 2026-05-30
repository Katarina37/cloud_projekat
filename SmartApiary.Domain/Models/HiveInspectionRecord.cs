namespace SmartApiary.Domain.Models;

public class HiveInspectionRecord
{
    private HiveInspectionRecord()
    {
    }

    public HiveInspectionRecord(
        Guid hiveId,
        DateTime date,
        int framesWithHoney,
        int broodFrames,
        bool queenPresent,
        string bottomBoardColor,
        decimal honeyQuantityKg,
        string? notes = null)
    {
        if (hiveId == Guid.Empty)
        {
            throw new ArgumentException("Hive id cannot be empty.", nameof(hiveId));
        }

        Id = Guid.NewGuid();
        HiveId = hiveId;
        Date = date;
        FramesWithHoney = RequireNonNegative(framesWithHoney, nameof(framesWithHoney));
        BroodFrames = RequireNonNegative(broodFrames, nameof(broodFrames));
        QueenPresent = queenPresent;
        BottomBoardColor = bottomBoardColor ?? throw new ArgumentNullException(nameof(bottomBoardColor));
        HoneyQuantityKg = RequireNonNegative(honeyQuantityKg, nameof(honeyQuantityKg));
        Notes = notes;
    }

    public Guid Id { get; private set; }
    public Guid HiveId { get; private set; }
    public DateTime Date { get; private set; }
    public int FramesWithHoney { get; private set; }
    public int BroodFrames { get; private set; }
    public bool QueenPresent { get; private set; }
    public string BottomBoardColor { get; private set; } = string.Empty;
    public decimal HoneyQuantityKg { get; private set; }
    public string? Notes { get; private set; }

    public void Update(
        Guid hiveId,
        DateTime date,
        int framesWithHoney,
        int broodFrames,
        bool queenPresent,
        string bottomBoardColor,
        decimal honeyQuantityKg,
        string? notes)
    {
        if (hiveId == Guid.Empty)
        {
            throw new ArgumentException("Hive id cannot be empty.", nameof(hiveId));
        }

        HiveId = hiveId;
        Date = date;
        FramesWithHoney = RequireNonNegative(framesWithHoney, nameof(framesWithHoney));
        BroodFrames = RequireNonNegative(broodFrames, nameof(broodFrames));
        QueenPresent = queenPresent;
        BottomBoardColor = bottomBoardColor ?? throw new ArgumentNullException(nameof(bottomBoardColor));
        HoneyQuantityKg = RequireNonNegative(honeyQuantityKg, nameof(honeyQuantityKg));
        Notes = notes;
    }

    private static int RequireNonNegative(int value, string parameterName)
    {
        if (value < 0)
        {
            throw new ArgumentOutOfRangeException(parameterName, "Value cannot be negative.");
        }
        return value;
    }

    private static decimal RequireNonNegative(decimal value, string parameterName)
    {
        if (value < 0)
        {
            throw new ArgumentOutOfRangeException(parameterName, "Value cannot be negative.");
        }
        return value;
    }
}
