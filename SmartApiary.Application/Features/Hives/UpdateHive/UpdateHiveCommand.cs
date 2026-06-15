// Podaci koji stizu kada menjamo kosnicu.

using MediatR;
using SmartApiary.Application.Common.Results;
using SmartApiary.Domain.Enums;

namespace SmartApiary.Application.Features.Hives.UpdateHive;

public sealed record UpdateHiveCommand(
    Guid HiveId,
    string Label,
    HiveType Type,
    string BoxColor,
    int QueenAgeYears,
    string? Notes) : IRequest<Result>;
