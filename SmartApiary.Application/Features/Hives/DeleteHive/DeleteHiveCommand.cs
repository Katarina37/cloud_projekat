using MediatR;
using SmartApiary.Application.Common.Results;

namespace SmartApiary.Application.Features.Hives.DeleteHive;

public sealed record DeleteHiveCommand(Guid HiveId) : IRequest<Result>;
