using MediatR;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Application.Interfaces.Services;

namespace SmartApiary.Application.Features.Auth.ActivateAccount;

public sealed class ActivateAccountCommandHandler : IRequestHandler<ActivateAccountCommand, Result>
{
    private readonly IDateTimeProvider _dateTimeProvider;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserRepository _userRepository;

    public ActivateAccountCommandHandler(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        IDateTimeProvider dateTimeProvider,
        IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _dateTimeProvider = dateTimeProvider;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(ActivateAccountCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByActivationTokenAsync(request.Token.Trim(), cancellationToken);
        if (user is null || user.ActivationTokenExpiresAt is null)
        {
            return Result.Failure("Activation token is invalid or expired.", ErrorType.Validation);
        }

        if (user.ActivationTokenExpiresAt <= _dateTimeProvider.UtcNow)
        {
            return Result.Failure("Activation token is invalid or expired.", ErrorType.Validation);
        }

        var passwordHash = _passwordHasher.Hash(request.Password);

        user.Activate(passwordHash);
        _userRepository.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
