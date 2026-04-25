using MediatR;
using SmartApiary.Application.Common.Results;

namespace SmartApiary.Application.Features.Devices.RegisterDevice;

public sealed record RegisterDeviceCommand(
    Guid HiveId,
    string SerialNumber) : IRequest<Result<Guid>>;
