using MediatR;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Application.Interfaces.Services;
using SmartApiary.Domain.Models;

namespace SmartApiary.Application.Features.Alerts.UpdateAlertSettings;

public sealed class UpdateAlertSettingsCommandHandler : IRequestHandler<UpdateAlertSettingsCommand, Result>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserAlertSettingsRepository _userAlertSettingsRepository;

    public UpdateAlertSettingsCommandHandler(
        ICurrentUserService currentUserService,
        IUserAlertSettingsRepository userAlertSettingsRepository,
        IUnitOfWork unitOfWork)
    {
        _currentUserService = currentUserService;
        _userAlertSettingsRepository = userAlertSettingsRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(UpdateAlertSettingsCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.IsAuthenticated || _currentUserService.UserId is not { } userId)
        {
            return Result.Failure("User is not authenticated.", ErrorType.Unauthorized);
        }

        var settings = await _userAlertSettingsRepository.GetByUserIdAsync(userId, cancellationToken);
        if (settings is null)
        {
            settings = new UserAlertSettings(userId);
            settings.UpdateWeightDropThreshold(request.WeightDropThresholdKg);
            await _userAlertSettingsRepository.AddAsync(settings, cancellationToken);
        }
        else
        {
            settings.UpdateWeightDropThreshold(request.WeightDropThresholdKg);
            _userAlertSettingsRepository.Update(settings);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
