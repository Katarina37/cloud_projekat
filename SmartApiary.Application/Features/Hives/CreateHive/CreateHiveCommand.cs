using MediatR;
using SmartApiary.Application.Common.Results;
using SmartApiary.Domain.Enums;

namespace SmartApiary.Application.Features.Hives.CreateHive;

public sealed record CreateHiveCommand(
    Guid ApiaryId,
    string Label,
    HiveType Type,
    string BoxColor,
    int QueenAgeYears,
    string? Notes) : IRequest<Result<Guid>>;
