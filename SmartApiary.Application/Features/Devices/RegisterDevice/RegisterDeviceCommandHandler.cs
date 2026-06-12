using MediatR;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Application.Interfaces.Services;
using SmartApiary.Domain.Models;

namespace SmartApiary.Application.Features.Devices.RegisterDevice;

public sealed class RegisterDeviceCommandHandler : IRequestHandler<RegisterDeviceCommand, Result<Guid>>
{
    private readonly IApiaryRepository _apiaryRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IDeviceRepository _deviceRepository;
    private readonly IHiveRepository _hiveRepository;
    private readonly IUnitOfWork _unitOfWork;

    public RegisterDeviceCommandHandler(
        ICurrentUserService currentUserService,
        IHiveRepository hiveRepository,
        IApiaryRepository apiaryRepository,
        IDeviceRepository deviceRepository,
        IUnitOfWork unitOfWork)
    {
        _currentUserService = currentUserService;
        _hiveRepository = hiveRepository;
        _apiaryRepository = apiaryRepository;
        _deviceRepository = deviceRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Guid>> Handle(RegisterDeviceCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.IsAuthenticated || _currentUserService.UserId is not { } beekeeperId)
        {
            return Result<Guid>.Failure("User is not authenticated.", ErrorType.Unauthorized);
        }

        var hive = await _hiveRepository.GetByIdAsync(request.HiveId, cancellationToken);
        if (hive is null)
        {
            return Result<Guid>.Failure("Hive was not found.", ErrorType.NotFound);
        }

        var apiary = await _apiaryRepository.GetByIdAsync(hive.ApiaryId, cancellationToken);
        if (apiary is null)
        {
            return Result<Guid>.Failure("Apiary was not found.", ErrorType.NotFound);
        }

        if (apiary.BeekeeperId != beekeeperId)
        {
            return Result<Guid>.Failure("Hive does not belong to the current beekeeper.", ErrorType.Unauthorized);
        }

        var existingDeviceWithSerialNumber = await _deviceRepository.GetBySerialNumberAsync(
            request.SerialNumber,
            cancellationToken);
        if (existingDeviceWithSerialNumber is not null)
        {
            return Result<Guid>.Failure("Device with this serial number is already registered.", ErrorType.Conflict);
        }

        var existingDevice = await _deviceRepository.GetByHiveIdAsync(request.HiveId, cancellationToken);
        if (existingDevice is not null)
        {
            return Result<Guid>.Failure("Hive already has a registered device.", ErrorType.Conflict);
        }

        var device = new Device(request.HiveId, request.SerialNumber);

        await _deviceRepository.AddAsync(device, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Success(device.Id);
    }
}
