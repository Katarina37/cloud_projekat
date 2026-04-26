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
    string? Notes) : IRequest<Result>;
