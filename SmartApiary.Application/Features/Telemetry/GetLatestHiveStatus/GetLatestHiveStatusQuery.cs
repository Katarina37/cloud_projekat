using MediatR;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.DTOs;

namespace SmartApiary.Application.Features.Telemetry.GetLatestHiveStatus;

public sealed record GetLatestHiveStatusQuery(Guid HiveId) : IRequest<Result<LatestHiveStatusDto>>;
