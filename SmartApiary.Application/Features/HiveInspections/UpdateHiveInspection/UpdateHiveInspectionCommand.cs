// Podaci koji stizu kada menjamo pregled kosnice.

using MediatR;
using SmartApiary.Application.Common.Results;

namespace SmartApiary.Application.Features.HiveInspections.UpdateHiveInspection;

public sealed record UpdateHiveInspectionCommand(
    Guid Id,
    Guid HiveId,
    DateTime Date,
    int FramesWithHoney,
    int BroodFrames,
    bool QueenPresent,
    string BottomBoardColor,
    decimal HoneyQuantityKg,
    string? Notes) : IRequest<Result>;
