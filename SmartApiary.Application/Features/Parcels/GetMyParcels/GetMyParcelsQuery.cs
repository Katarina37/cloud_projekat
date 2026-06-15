// Podaci koji su potrebni kada ucitavamo parcele prijavljenog farmera.

using MediatR;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.DTOs;

namespace SmartApiary.Application.Features.Parcels.GetMyParcels;

public sealed record GetMyParcelsQuery : IRequest<Result<IReadOnlyList<ParcelDto>>>;
