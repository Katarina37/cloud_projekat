using MediatR;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.DTOs;

namespace SmartApiary.Application.Features.HiveInspections.GetHiveInspectionsByHiveId;

public sealed record GetHiveInspectionsByHiveIdQuery(Guid HiveId)
    : IRequest<Result<IReadOnlyList<HiveInspectionDto>>>;
