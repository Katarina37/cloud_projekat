// Podaci koji su potrebni kada ucitavamo korisnike.

using MediatR;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.DTOs;

namespace SmartApiary.Application.Features.Admin.Users.GetUsers;

public sealed record GetUsersQuery : IRequest<Result<IReadOnlyList<UserDto>>>;
