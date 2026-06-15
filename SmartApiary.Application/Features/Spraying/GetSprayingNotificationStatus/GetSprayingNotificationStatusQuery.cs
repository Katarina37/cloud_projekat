// Podaci koji su potrebni kada proveravamo koliko je pcelara obavesteno.

using MediatR;
using SmartApiary.Application.Common.Results;

namespace SmartApiary.Application.Features.Spraying.GetSprayingNotificationStatus;

public sealed record GetSprayingNotificationStatusQuery(Guid SprayingAnnouncementId) : IRequest<Result<int>>;
