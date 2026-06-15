// Ovde trazimo uredjaj povezan sa kosnicom.
// Specifikacija - registracija i aktivacija uredjaja.

using MediatR;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.DTOs;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Application.Interfaces.Services;

namespace SmartApiary.Application.Features.Devices.GetDeviceByHive;

public sealed class GetDeviceByHiveQueryHandler : IRequestHandler<GetDeviceByHiveQuery, Result<DeviceDto>>
{
    private readonly IApiaryRepository _apiaryRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IDeviceRepository _deviceRepository;
    private readonly IHiveRepository _hiveRepository;

    public GetDeviceByHiveQueryHandler(
        ICurrentUserService currentUserService,
        IHiveRepository hiveRepository,
        IApiaryRepository apiaryRepository,
        IDeviceRepository deviceRepository)
    {
        _currentUserService = currentUserService;
        _hiveRepository = hiveRepository;
        _apiaryRepository = apiaryRepository;
        _deviceRepository = deviceRepository;
    }

    public async Task<Result<DeviceDto>> Handle(GetDeviceByHiveQuery request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.IsAuthenticated || _currentUserService.UserId is not { } beekeeperId)
        {
            return Result<DeviceDto>.Failure("User is not authenticated.", ErrorType.Unauthorized);
        }

        var hive = await _hiveRepository.GetByIdAsync(request.HiveId, cancellationToken);
        if (hive is null)
        {
            return Result<DeviceDto>.Failure("Hive was not found.", ErrorType.NotFound);
        }

        var apiary = await _apiaryRepository.GetByIdAsync(hive.ApiaryId, cancellationToken);
        if (apiary is null)
        {
            return Result<DeviceDto>.Failure("Apiary was not found.", ErrorType.NotFound);
        }

        if (apiary.BeekeeperId != beekeeperId)
        {
            return Result<DeviceDto>.Failure("Hive does not belong to the current beekeeper.", ErrorType.Unauthorized);
        }

        var device = await _deviceRepository.GetByHiveIdAsync(request.HiveId, cancellationToken);
        if (device is null)
        {
            return Result<DeviceDto>.Failure("Device was not found.", ErrorType.NotFound);
        }

        var deviceDto = new DeviceDto
        {
            Id = device.Id,
            HiveId = device.HiveId,
            SerialNumber = device.SerialNumber,
            DeviceIdentifier = device.DeviceIdentifier,
            Status = device.Status.ToString(),
            CreatedAt = device.CreatedAt,
            PairedAt = device.PairedAt
        };

        return Result<DeviceDto>.Success(deviceDto);
    }
}
