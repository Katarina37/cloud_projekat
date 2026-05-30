using MediatR;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.DTOs;

namespace SmartApiary.Application.Features.HiveInspections.GetHiveInspectionsByHiveId;

public sealed record GetHiveInspectionsByHiveIdQuery(
    Guid HiveId, 
    int PageNumber = 1, 
    int PageSize = 10) 
    : IRequest<Result<PagedList<HiveInspectionDto>>>;
