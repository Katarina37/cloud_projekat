using MediatR;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.DTOs;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Application.Interfaces.Services;

namespace SmartApiary.Application.Features.Alerts.GetAlertSettings;

public sealed class GetAlertSettingsQueryHandler : IRequestHandler<GetAlertSettingsQuery, Result<AlertSettingsDto>>
{
    private const double DefaultWeightDropThresholdKg = 10d;

    private readonly ICurrentUserService _currentUserService;
    private readonly IDateTimeProvider _dateTimeProvider;
    private readonly IUserAlertSettingsRepository _userAlertSettingsRepository;

    public GetAlertSettingsQueryHandler(
        ICurrentUserService currentUserService,
        IDateTimeProvider dateTimeProvider,
        IUserAlertSettingsRepository userAlertSettingsRepository)
    {
        _currentUserService = currentUserService;
        _dateTimeProvider = dateTimeProvider;
        _userAlertSettingsRepository = userAlertSettingsRepository;
    }

    public async Task<Result<AlertSettingsDto>> Handle(
        GetAlertSettingsQuery request,
        CancellationToken cancellationToken)
    {
        if (!_currentUserService.IsAuthenticated || _currentUserService.UserId is not { } userId)
        {
            return Result<AlertSettingsDto>.Failure("User is not authenticated.", ErrorType.Unauthorized);
        }

        var settings = await _userAlertSettingsRepository.GetByUserIdAsync(userId, cancellationToken);

        var alertSettingsDto = settings is null
            ? new AlertSettingsDto
            {
                UserId = userId,
                WeightDropThresholdKg = DefaultWeightDropThresholdKg,
                UpdatedAt = _dateTimeProvider.UtcNow
            }
            : new AlertSettingsDto
            {
                UserId = settings.UserId,
                WeightDropThresholdKg = settings.WeightDropThresholdKg,
                UpdatedAt = settings.UpdatedAt
            };

        return Result<AlertSettingsDto>.Success(alertSettingsDto);
    }
}
