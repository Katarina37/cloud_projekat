// Podaci koji stizu kada menjamo kulturu.

using MediatR;
using SmartApiary.Application.Common.Results;

namespace SmartApiary.Application.Features.Crops.UpdateCrop;

public sealed record UpdateCropCommand(
    Guid CropId,
    string Name,
    DateTime ExpectedBloomingStart,
    DateTime ExpectedBloomingEnd,
    double? Area,
    string? Notes) : IRequest<Result>;
