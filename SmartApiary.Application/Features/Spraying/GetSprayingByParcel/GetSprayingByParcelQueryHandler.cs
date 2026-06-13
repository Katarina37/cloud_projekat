using MediatR;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.DTOs;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Application.Interfaces.Services;
using System.Text.Json;

namespace SmartApiary.Application.Features.Spraying.GetSprayingByParcel;

public sealed class GetSprayingByParcelQueryHandler
    : IRequestHandler<GetSprayingByParcelQuery, Result<PagedList<SprayingAnnouncementDto>>>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IParcelRepository _parcelRepository;
    private readonly ISprayingAnnouncementRepository _sprayingRepository;
    private readonly IUserRepository _userRepository;

    public GetSprayingByParcelQueryHandler(
        ICurrentUserService currentUserService,
        IParcelRepository parcelRepository,
        ISprayingAnnouncementRepository sprayingRepository,
        IUserRepository userRepository)
    {
        _currentUserService = currentUserService;
        _parcelRepository = parcelRepository;
        _sprayingRepository = sprayingRepository;
        _userRepository = userRepository;
    }

    public async Task<Result<PagedList<SprayingAnnouncementDto>>> Handle(
        GetSprayingByParcelQuery request,
        CancellationToken cancellationToken)
    {
        if (!_currentUserService.IsAuthenticated || _currentUserService.UserId is not { } farmerId)
        {
            return Result<PagedList<SprayingAnnouncementDto>>.Failure("User is not authenticated.", ErrorType.Unauthorized);
        }

        var parcel = await _parcelRepository.GetByIdAsync(request.ParcelId, cancellationToken);
        if (parcel is null)
        {
            return Result<PagedList<SprayingAnnouncementDto>>.Failure("Parcel was not found.", ErrorType.NotFound);
        }

        if (parcel.FarmerId != farmerId)
        {
            return Result<PagedList<SprayingAnnouncementDto>>.Failure("Parcel does not belong to current farmer.", ErrorType.Unauthorized);
        }

        var (items, totalCount) = await _sprayingRepository.GetFilteredSprayingsAsync(
            request.ParcelId, request.FromDate, request.ToDate, request.PageNumber, request.PageSize, cancellationToken);
        var farmer = await _userRepository.GetByIdAsync(parcel.FarmerId, cancellationToken);
        var farmerName = farmer is null
            ? string.Empty
            : $"{farmer.FirstName} {farmer.LastName}".Trim();

        var mappedDtos = items.Select(s => {
            WeatherInfoDto? weatherObject = null;
            if (!string.IsNullOrEmpty(s.WeatherSnapshotJson) && s.WeatherSnapshotJson != "No weather data")
            {
                try
                {
                    weatherObject = JsonSerializer.Deserialize<WeatherInfoDto>(s.WeatherSnapshotJson);
                }
                catch
                {
                    
                }
            }

            return new SprayingAnnouncementDto
            {
                Id = s.Id,
                ParcelId = s.ParcelId,
                ParcelName = parcel.Name,
                StartTime = s.StartTime,
                DurationHours = s.DurationHours,
                PreparationType = s.PreparationType,
                Status = s.Status.ToString(),
                NotifiedBeekeepersCount = s.NotifiedBeekeepersCount,
                CreatedAt = s.CreatedAt,
                CancelledAt = s.CancelledAt,
                ActualStartTime = s.ActualStartTime,
                ActualEndTime = s.ActualEndTime,
                CropId = s.CropId,
                CropName = s.CropName,
                Note = s.Note,
                FarmerName = farmerName,
                WeatherSnapshot = weatherObject 
            };
        }).ToList();

        var pagedList = new PagedList<SprayingAnnouncementDto>(mappedDtos, totalCount, request.PageNumber, request.PageSize);
        return Result<PagedList<SprayingAnnouncementDto>>.Success(pagedList);
    }
}
