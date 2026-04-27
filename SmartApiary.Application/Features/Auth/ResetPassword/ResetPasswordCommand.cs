using MediatR;
using SmartApiary.Application.Common.Results;

namespace SmartApiary.Application.Features.Auth.ResetPassword;

public sealed record ResetPasswordCommand(
    string Token,
    string Password,
    string ConfirmPassword) : IRequest<Result>;
