// Podaci koji stizu kada otkazujemo prskanje.

using MediatR;
using SmartApiary.Application.Common.Results;

namespace SmartApiary.Application.Features.Spraying.CancelSpraying;

public sealed record CancelSprayingCommand(Guid SprayingAnnouncementId) : IRequest<Result>;
