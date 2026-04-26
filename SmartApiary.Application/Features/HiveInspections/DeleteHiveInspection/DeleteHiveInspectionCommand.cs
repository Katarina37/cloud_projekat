using MediatR;
using SmartApiary.Application.Common.Results;

namespace SmartApiary.Application.Features.HiveInspections.DeleteHiveInspection;

public sealed record DeleteHiveInspectionCommand(Guid Id) : IRequest<Result>;
