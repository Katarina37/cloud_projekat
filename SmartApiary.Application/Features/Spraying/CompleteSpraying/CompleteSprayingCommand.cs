using MediatR;
using SmartApiary.Application.Common.Results;

namespace SmartApiary.Application.Features.Spraying.CompleteSpraying;

public sealed record CompleteSprayingCommand(Guid SprayingAnnouncementId) : IRequest<Result>;
