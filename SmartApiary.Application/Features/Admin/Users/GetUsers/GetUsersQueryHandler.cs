// Ovde ucitavamo korisnike.
// Specifikacija - administracija korisnika.

using MediatR;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.DTOs;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Application.Interfaces.Services;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.Models;

namespace SmartApiary.Application.Features.Admin.Users.GetUsers;

public sealed class GetUsersQueryHandler : IRequestHandler<GetUsersQuery, Result<IReadOnlyList<UserDto>>>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IUserRepository _userRepository;

    public GetUsersQueryHandler(
        ICurrentUserService currentUserService,
        IUserRepository userRepository)
    {
        _currentUserService = currentUserService;
        _userRepository = userRepository;
    }

    public async Task<Result<IReadOnlyList<UserDto>>> Handle(GetUsersQuery request, CancellationToken cancellationToken)
    {
        if (!IsAdmin())
        {
            return Result<IReadOnlyList<UserDto>>.Failure("User is not authorized to view users.", ErrorType.Unauthorized);
        }

        var users = await _userRepository.GetAllAsync(cancellationToken);
        var userDtos = users.Select(MapToDto).ToList();

        return Result<IReadOnlyList<UserDto>>.Success(userDtos);
    }

    private bool IsAdmin()
    {
        return _currentUserService.IsAuthenticated
            && string.Equals(_currentUserService.Role, UserRole.Admin.ToString(), StringComparison.OrdinalIgnoreCase);
    }

    private static UserDto MapToDto(User user)
    {
        return new UserDto
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            PhoneNumber = user.PhoneNumber,
            Role = user.Role.ToString(),
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        };
    }
}
