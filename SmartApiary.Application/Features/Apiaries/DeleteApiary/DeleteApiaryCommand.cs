using MediatR;
using SmartApiary.Application.Common.Results;

namespace SmartApiary.Application.Features.Apiaries.DeleteApiary;

public sealed record DeleteApiaryCommand(Guid ApiaryId) : IRequest<Result>;
