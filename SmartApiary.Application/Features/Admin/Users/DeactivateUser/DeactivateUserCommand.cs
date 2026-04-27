using MediatR;
using SmartApiary.Application.Common.Results;

namespace SmartApiary.Application.Features.Admin.Users.DeactivateUser;

public sealed record DeactivateUserCommand(Guid UserId) : IRequest<Result>;
