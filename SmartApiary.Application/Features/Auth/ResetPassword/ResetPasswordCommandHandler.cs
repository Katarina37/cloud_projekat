// Ovde postavljamo novu lozinku.
// Specifikacija - prijava, JWT i aktivacija naloga.

using MediatR;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Application.Interfaces.Services;

namespace SmartApiary.Application.Features.Auth.ResetPassword;

public sealed class ResetPasswordCommandHandler : IRequestHandler<ResetPasswordCommand, Result>
{
    private readonly IDateTimeProvider _dateTimeProvider;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserRepository _userRepository;

    public ResetPasswordCommandHandler(
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

    public async Task<Result> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByPasswordResetTokenAsync(request.Token.Trim(), cancellationToken);
        if (user is null || user.PasswordResetTokenExpiresAt is null || !user.IsActive)
        {
            return Result.Failure("Password reset token is invalid or expired.", ErrorType.Validation);
        }

        if (user.PasswordResetTokenExpiresAt <= _dateTimeProvider.UtcNow)
        {
            return Result.Failure("Password reset token is invalid or expired.", ErrorType.Validation);
        }

        var passwordHash = _passwordHasher.Hash(request.Password);

        user.ResetPassword(passwordHash);
        _userRepository.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
