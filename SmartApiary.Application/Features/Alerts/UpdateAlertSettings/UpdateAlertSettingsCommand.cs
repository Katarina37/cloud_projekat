using MediatR;
using SmartApiary.Application.Common.Results;

namespace SmartApiary.Application.Features.Alerts.UpdateAlertSettings;

public sealed record UpdateAlertSettingsCommand(double WeightDropThresholdKg) : IRequest<Result>;
