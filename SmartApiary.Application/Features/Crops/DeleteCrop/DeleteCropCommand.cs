using MediatR;
using SmartApiary.Application.Common.Results;

namespace SmartApiary.Application.Features.Crops.DeleteCrop;

public sealed record DeleteCropCommand(Guid CropId) : IRequest<Result>;
