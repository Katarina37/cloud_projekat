using MediatR;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Application.Interfaces.Services;

namespace SmartApiary.Application.Features.Auth.ForgotPassword;

public sealed class ForgotPasswordCommandHandler : IRequestHandler<ForgotPasswordCommand, Result>
{
    private static readonly TimeSpan PasswordResetTokenLifetime = TimeSpan.FromHours(1);

    private readonly IAccountTokenGenerator _accountTokenGenerator;
    private readonly IDateTimeProvider _dateTimeProvider;
    private readonly IEmailService _emailService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserRepository _userRepository;

    public ForgotPasswordCommandHandler(
        IUserRepository userRepository,
        IAccountTokenGenerator accountTokenGenerator,
        IDateTimeProvider dateTimeProvider,
        IEmailService emailService,
        IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _accountTokenGenerator = accountTokenGenerator;
        _dateTimeProvider = dateTimeProvider;
        _emailService = emailService;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email.Trim(), cancellationToken);
        if (user is null || !user.IsActive)
        {
            return Result.Success();
        }

        var resetToken = _accountTokenGenerator.GenerateToken();
        user.SetPasswordResetToken(resetToken, _dateTimeProvider.UtcNow.Add(PasswordResetTokenLifetime));

        _userRepository.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _emailService.SendPasswordResetEmailAsync(
            user.Email,
            resetToken,
            cancellationToken);

        return Result.Success();
    }
}
