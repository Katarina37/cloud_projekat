using MediatR;
using SmartApiary.Application.Common.Results;

namespace SmartApiary.Application.Features.Apiaries.UpdateApiary;

public sealed record UpdateApiaryCommand(
    Guid ApiaryId,
    string Name,
    double Latitude,
    double Longitude,
    string? TerrainDescription) : IRequest<Result>;
