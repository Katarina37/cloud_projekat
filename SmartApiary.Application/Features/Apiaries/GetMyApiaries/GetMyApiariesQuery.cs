// Podaci koji su potrebni kada ucitavamo pcelinjake prijavljenog pcelara.

using MediatR;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.DTOs;

namespace SmartApiary.Application.Features.Apiaries.GetMyApiaries;

public sealed record GetMyApiariesQuery : IRequest<Result<IReadOnlyList<ApiaryDto>>>;
