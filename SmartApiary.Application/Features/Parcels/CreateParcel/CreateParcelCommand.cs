// Podaci koji stizu kada dodajemo parcelu.

using MediatR;
using SmartApiary.Application.Common.Results;

namespace SmartApiary.Application.Features.Parcels.CreateParcel;

public sealed record CreateParcelCommand(
    string Name,
    double Latitude,
    double Longitude) : IRequest<Result<Guid>>;
