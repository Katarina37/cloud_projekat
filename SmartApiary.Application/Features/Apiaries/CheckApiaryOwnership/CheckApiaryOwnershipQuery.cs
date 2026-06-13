using MediatR;
using SmartApiary.Application.Common.Results;

namespace SmartApiary.Application.Features.Apiaries.CheckApiaryOwnership;

public sealed record CheckApiaryOwnershipQuery(Guid ApiaryId) : IRequest<Result>;
