using MediatR;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.DTOs;

namespace SmartApiary.Application.Features.Spraying.GetSprayingByParcel;

public sealed record GetSprayingByParcelQuery(Guid ParcelId) : IRequest<Result<IReadOnlyList<SprayingAnnouncementDto>>>;
