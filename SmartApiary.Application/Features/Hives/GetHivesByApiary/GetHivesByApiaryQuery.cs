// Podaci koji su potrebni kada ucitavamo kosnice iz pcelinjaka.

using MediatR;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.DTOs;

namespace SmartApiary.Application.Features.Hives.GetHivesByApiary;

public sealed record GetHivesByApiaryQuery(Guid ApiaryId) : IRequest<Result<IReadOnlyList<HiveDto>>>;
