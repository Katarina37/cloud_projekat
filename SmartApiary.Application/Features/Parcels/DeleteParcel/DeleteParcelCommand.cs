using MediatR;
using SmartApiary.Application.Common.Results;

namespace SmartApiary.Application.Features.Parcels.DeleteParcel;

public sealed record DeleteParcelCommand(Guid ParcelId) : IRequest<Result>;
