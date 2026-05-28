using MediatR;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.DTOs;

namespace SmartApiary.Application.Features.Map.GetNearbyParcels;

public sealed record GetNearbyParcelsQuery(Guid ApiaryId)
    : IRequest<Result<IReadOnlyList<MapParcelDto>>>;
