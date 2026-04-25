using Microsoft.EntityFrameworkCore;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Models;
using SmartApiary.Infrastructure.Persistence;

namespace SmartApiary.Infrastructure.Repositories;

public class CropRepository : ICropRepository
{
    private readonly SmartApiaryDbContext _context;

    public CropRepository(SmartApiaryDbContext context)
    {
        _context = context;
    }

    public Task<Crop?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return _context.Crops.FirstOrDefaultAsync(crop => crop.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<Crop>> GetByParcelIdAsync(
        Guid parcelId,
        CancellationToken cancellationToken = default)
    {
        return await _context.Crops
            .Where(crop => crop.ParcelId == parcelId)
            .OrderBy(crop => crop.ExpectedBloomingStart)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Crop crop, CancellationToken cancellationToken = default)
    {
        await _context.Crops.AddAsync(crop, cancellationToken);
    }

    public void Update(Crop crop)
    {
        _context.Crops.Update(crop);
    }

    public void Delete(Crop crop)
    {
        _context.Crops.Remove(crop);
    }
}
