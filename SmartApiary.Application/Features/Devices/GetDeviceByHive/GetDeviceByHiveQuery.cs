// Podaci koji su potrebni kada trazimo uredjaj povezan sa kosnicom.

using MediatR;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.DTOs;

namespace SmartApiary.Application.Features.Devices.GetDeviceByHive;

public sealed record GetDeviceByHiveQuery(Guid HiveId) : IRequest<Result<DeviceDto>>;
