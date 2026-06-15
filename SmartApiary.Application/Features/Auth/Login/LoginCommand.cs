// Podaci koji stizu kada prijavljujemo korisnika.

using MediatR;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.DTOs;

namespace SmartApiary.Application.Features.Auth.Login;

public sealed record LoginCommand(string Email, string Password) : IRequest<Result<LoginResponseDto>>;
