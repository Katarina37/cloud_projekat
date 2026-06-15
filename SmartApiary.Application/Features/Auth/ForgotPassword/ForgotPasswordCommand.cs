// Podaci koji stizu kada saljemo link za zaboravljenu lozinku.

using MediatR;
using SmartApiary.Application.Common.Results;

namespace SmartApiary.Application.Features.Auth.ForgotPassword;

public sealed record ForgotPasswordCommand(string Email) : IRequest<Result>;
