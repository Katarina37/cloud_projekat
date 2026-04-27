using MediatR;
using SmartApiary.Application.Common.Results;
using SmartApiary.Domain.Enums;

namespace SmartApiary.Application.Features.Admin.Users.CreateUser;

public sealed record CreateUserCommand(
    string FirstName,
    string LastName,
    string Email,
    string PhoneNumber,
    UserRole Role) : IRequest<Result<Guid>>;
