using MediatR;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Application.Interfaces.Services;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.Models;

namespace SmartApiary.Application.Features.Admin.Users.CreateUser;

public sealed class CreateUserCommandHandler : IRequestHandler<CreateUserCommand, Result<Guid>>
{
    private static readonly TimeSpan ActivationTokenLifetime = TimeSpan.FromHours(24);

    private readonly IAccountTokenGenerator _accountTokenGenerator;
    private readonly ICurrentUserService _currentUserService;
    private readonly IDateTimeProvider _dateTimeProvider;
    private readonly IEmailService _emailService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserRepository _userRepository;

    public CreateUserCommandHandler(
        ICurrentUserService currentUserService,
        IUserRepository userRepository,
        IAccountTokenGenerator accountTokenGenerator,
        IDateTimeProvider dateTimeProvider,
        IEmailService emailService,
        IUnitOfWork unitOfWork)
    {
        _currentUserService = currentUserService;
        _userRepository = userRepository;
        _accountTokenGenerator = accountTokenGenerator;
        _dateTimeProvider = dateTimeProvider;
        _emailService = emailService;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Guid>> Handle(CreateUserCommand request, CancellationToken cancellationToken)
    {
        if (!IsAdmin())
        {
            return Result<Guid>.Failure("User is not authorized to create users.");
        }

        var email = request.Email.Trim();
        var existingUser = await _userRepository.GetByEmailAsync(email, cancellationToken);
        if (existingUser is not null)
        {
            return Result<Guid>.Failure("User with this email already exists.");
        }

        var user = new User(
            request.FirstName.Trim(),
            request.LastName.Trim(),
            email,
            request.PhoneNumber.Trim(),
            request.Role);

        var activationToken = _accountTokenGenerator.GenerateToken();
        user.SetActivationToken(activationToken, _dateTimeProvider.UtcNow.Add(ActivationTokenLifetime));

        await _userRepository.AddAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _emailService.SendActivationEmailAsync(
            user.Email,
            user.FirstName,
            activationToken,
            cancellationToken);

        return Result<Guid>.Success(user.Id);
    }

    private bool IsAdmin()
    {
        return _currentUserService.IsAuthenticated
            && string.Equals(_currentUserService.Role, UserRole.Admin.ToString(), StringComparison.OrdinalIgnoreCase);
    }

}
