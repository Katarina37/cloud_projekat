using MediatR;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.DTOs;

namespace SmartApiary.Application.Features.Spraying.GetSprayingByParcel;

public sealed record GetSprayingByParcelQuery(
    Guid ParcelId,
    DateTime? FromDate = null,
    DateTime? ToDate = null,
    int PageNumber = 1,
    int PageSize = 10) : IRequest<Result<PagedList<SprayingAnnouncementDto>>>;
