using MediatR;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.DTOs;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Application.Interfaces.Services;

namespace SmartApiary.Application.Features.HiveInspections.GetHiveInspectionsByHiveId;

public sealed class GetHiveInspectionsByHiveIdQueryHandler
    : IRequestHandler<GetHiveInspectionsByHiveIdQuery, Result<PagedList<HiveInspectionDto>>>
{
    private readonly IApiaryRepository _apiaryRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IHiveInspectionRepository _hiveInspectionRepository;
    private readonly IHiveRepository _hiveRepository;

    public GetHiveInspectionsByHiveIdQueryHandler(
        ICurrentUserService currentUserService,
        IHiveRepository hiveRepository,
        IApiaryRepository apiaryRepository,
        IHiveInspectionRepository hiveInspectionRepository)
    {
        _currentUserService = currentUserService;
        _hiveRepository = hiveRepository;
        _apiaryRepository = apiaryRepository;
        _hiveInspectionRepository = hiveInspectionRepository;
    }

    public async Task<Result<PagedList<HiveInspectionDto>>> Handle(
        GetHiveInspectionsByHiveIdQuery request,
        CancellationToken cancellationToken)
    {
        if (!_currentUserService.IsAuthenticated || _currentUserService.UserId is not { } beekeeperId)
        {
            return Result<PagedList<HiveInspectionDto>>.Failure("User is not authenticated.");
        }

        var hive = await _hiveRepository.GetByIdAsync(request.HiveId, cancellationToken);
        if (hive is null)
        {
            return Result<PagedList<HiveInspectionDto>>.Failure("Hive was not found.");
        }

        var apiary = await _apiaryRepository.GetByIdAsync(hive.ApiaryId, cancellationToken);
        if (apiary is null)
        {
            return Result<PagedList<HiveInspectionDto>>.Failure("Apiary was not found.");
        }

        if (apiary.BeekeeperId != beekeeperId)
        {
            return Result<PagedList<HiveInspectionDto>>.Failure("Hive does not belong to the current beekeeper.");
        }

        var records = await _hiveInspectionRepository.GetByHiveIdAsync(request.HiveId, cancellationToken);
        var orderedRecords = records.OrderByDescending(r => r.Date).ToList();
        var totalCount = orderedRecords.Count;

        //Paginacija
        var pagedRecordDtos = orderedRecords
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(record => new HiveInspectionDto
            {
                Id = record.Id,
                HiveId = record.HiveId,
                Date = record.Date,
                FramesWithHoney = record.FramesWithHoney,
                BroodFrames = record.BroodFrames,
                QueenPresent = record.QueenPresent,
                BottomBoardColor = record.BottomBoardColor,
                HoneyQuantityKg = record.HoneyQuantityKg,
                Notes = record.Notes
            })
            .ToList();

        var pagedList = new PagedList<HiveInspectionDto>(pagedRecordDtos, totalCount, request.PageNumber, request.PageSize);

        return Result<PagedList<HiveInspectionDto>>.Success(pagedList);
    }
}
