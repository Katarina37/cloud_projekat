// Podaci koji stizu kada dodajemo pregled kosnice.

using MediatR;
using SmartApiary.Application.Common.Results;

namespace SmartApiary.Application.Features.HiveInspections.CreateHiveInspection;

public sealed record CreateHiveInspectionCommand(
    Guid HiveId,
    DateTime Date,
    int FramesWithHoney,
    int BroodFrames,
    bool QueenPresent,
    string BottomBoardColor,
    decimal HoneyQuantityKg,
    string? Notes) : IRequest<Result<Guid>>;
