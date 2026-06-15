// Podaci koji stizu kada dodajemo kulturu na parcelu.

using MediatR;
using SmartApiary.Application.Common.Results;

namespace SmartApiary.Application.Features.Crops.AddCrop;

public sealed record AddCropCommand(
    Guid ParcelId,
    string Name,
    DateTime ExpectedBloomingStart,
    DateTime ExpectedBloomingEnd,
    double? Area,
    string? Notes) : IRequest<Result<Guid>>;
