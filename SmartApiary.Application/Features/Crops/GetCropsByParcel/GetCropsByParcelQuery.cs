using MediatR;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.DTOs;

namespace SmartApiary.Application.Features.Crops.GetCropsByParcel;

public sealed record GetCropsByParcelQuery(Guid ParcelId) : IRequest<Result<IReadOnlyList<CropDto>>>;
