using MediatR;
using SmartApiary.Application.Common.Results;

namespace SmartApiary.Application.Features.Parcels.UpdateParcel;

public sealed record UpdateParcelCommand(
    Guid ParcelId,
    string Name,
    double Latitude,
    double Longitude) : IRequest<Result>;
