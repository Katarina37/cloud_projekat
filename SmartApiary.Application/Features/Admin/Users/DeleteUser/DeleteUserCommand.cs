using MediatR;
using SmartApiary.Application.Common.Results;

namespace SmartApiary.Application.Features.Admin.Users.DeleteUser;

public sealed record DeleteUserCommand(Guid UserId) : IRequest<Result>;
