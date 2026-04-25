using MediatR;
using SmartApiary.Application.Common.Results;

namespace SmartApiary.Application.Features.Devices.ActivateDevice;

public sealed record ActivateDeviceCommand(
    string SerialNumber,
    string DeviceIdentifier) : IRequest<Result<string>>;
