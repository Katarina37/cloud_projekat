using SmartApiary.Domain.Enums;

namespace SmartApiary.Application.DTOs;

public class HiveDto
{
    public Guid Id { get; set; }

    public Guid ApiaryId { get; set; }

    public string Label { get; set; } = string.Empty;

    public HiveType Type { get; set; }

    public string BoxColor { get; set; } = string.Empty;

    public int QueenAgeYears { get; set; }

    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; }
}
