using MediatR;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Application.Interfaces.Services;
using SmartApiary.Domain.Enums;

namespace SmartApiary.Application.Features.Devices.ActivateDevice;

public sealed class ActivateDeviceCommandHandler : IRequestHandler<ActivateDeviceCommand, Result<string>>
{
    private readonly IDeviceRepository _deviceRepository;
    private readonly IDeviceTokenGenerator _deviceTokenGenerator;
    private readonly IUnitOfWork _unitOfWork;

    public ActivateDeviceCommandHandler(
        IDeviceRepository deviceRepository,
        IDeviceTokenGenerator deviceTokenGenerator,
        IUnitOfWork unitOfWork)
    {
        _deviceRepository = deviceRepository;
        _deviceTokenGenerator = deviceTokenGenerator;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<string>> Handle(ActivateDeviceCommand request, CancellationToken cancellationToken)
    {
        var device = await _deviceRepository.GetBySerialNumberAsync(request.SerialNumber, cancellationToken);
        if (device is null)
        {
            return Result<string>.Failure("Device was not found.", ErrorType.NotFound);
        }

        if (device.Status == DeviceStatus.Paired)
        {
            return Result<string>.Failure("Device is already paired.", ErrorType.Conflict);
        }

        var accessToken = _deviceTokenGenerator.GenerateToken();

        device.Pair(request.DeviceIdentifier, accessToken);
        _deviceRepository.Update(device);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<string>.Success(accessToken);
    }
}
