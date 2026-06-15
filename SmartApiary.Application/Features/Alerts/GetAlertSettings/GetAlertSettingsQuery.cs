// Podaci koji su potrebni kada ucitavamo podesavanja alarma.

using MediatR;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.DTOs;

namespace SmartApiary.Application.Features.Alerts.GetAlertSettings;

public sealed record GetAlertSettingsQuery : IRequest<Result<AlertSettingsDto>>;
