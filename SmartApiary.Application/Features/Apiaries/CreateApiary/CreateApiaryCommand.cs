using MediatR;
using SmartApiary.Application.Common.Results;

namespace SmartApiary.Application.Features.Apiaries.CreateApiary;

public sealed record CreateApiaryCommand(
    string Name,
    double Latitude,
    double Longitude,
    string? TerrainDescription,
    Stream? ImageStream,
    string? ImageFileName,
    string? ImageContentType,
    long ImageSizeInBytes) : IRequest<Result<Guid>>;
