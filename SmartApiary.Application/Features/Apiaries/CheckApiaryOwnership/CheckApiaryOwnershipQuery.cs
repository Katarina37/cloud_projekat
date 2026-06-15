// Podaci koji su potrebni kada proveravamo da li pcelinjak pripada prijavljenom pcelaru.

using MediatR;
using SmartApiary.Application.Common.Results;

namespace SmartApiary.Application.Features.Apiaries.CheckApiaryOwnership;

public sealed record CheckApiaryOwnershipQuery(Guid ApiaryId) : IRequest<Result>;
