using MediatR;
using SmartApiary.Application.Common.Results;

namespace SmartApiary.Application.Features.Apiaries.CreateApiary;

public sealed record CreateApiaryCommand(
    string Name,
    double Latitude,
    double Longitude,
    string? TerrainDescription,
    string? ImageUrl,
    string? ThumbnailUrl) : IRequest<Result<Guid>>;
