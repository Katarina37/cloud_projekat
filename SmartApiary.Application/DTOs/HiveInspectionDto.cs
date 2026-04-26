namespace SmartApiary.Application.DTOs;

public class HiveInspectionDto
{
    public Guid Id { get; set; }

    public Guid HiveId { get; set; }

    public DateTime Date { get; set; }

    public int FramesWithHoney { get; set; }

    public int BroodFrames { get; set; }

    public bool QueenPresent { get; set; }

    public string? Notes { get; set; }
}
