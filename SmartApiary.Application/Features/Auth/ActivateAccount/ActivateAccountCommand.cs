using MediatR;
using SmartApiary.Application.Common.Results;

namespace SmartApiary.Application.Features.Auth.ActivateAccount;

public sealed record ActivateAccountCommand(
    string Token,
    string Password,
    string ConfirmPassword) : IRequest<Result>;
