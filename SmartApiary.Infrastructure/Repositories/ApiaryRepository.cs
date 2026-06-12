using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Models;
using SmartApiary.Domain.ValueObjects;
using SmartApiary.Infrastructure.Persistence;

namespace SmartApiary.Infrastructure.Repositories;

public class ApiaryRepository : IApiaryRepository
{
    private readonly SmartApiaryDbContext _context;

    public ApiaryRepository(SmartApiaryDbContext context)
    {
        _context = context;
    }

    public Task<Apiary?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return _context.Apiaries.FirstOrDefaultAsync(apiary => apiary.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<Apiary>> GetByBeekeeperIdAsync(
        Guid beekeeperId,
        CancellationToken cancellationToken = default)
    {
        return await _context.Apiaries
            .Where(apiary => apiary.BeekeeperId == beekeeperId)
            .OrderBy(apiary => apiary.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Apiary>> FindWithinRadiusAsync(
        GeoLocation location,
        double radiusKm,
        CancellationToken cancellationToken = default)
    {
        var searchPoint = new Point(location.Longitude, location.Latitude)
        {
            SRID = 4326
        };
        var radiusMeters = radiusKm * 1000d;

        return await _context.Apiaries
            .Where(apiary =>
                EF.Property<Point>(apiary, "LocationPoint").Distance(searchPoint) <= radiusMeters)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Apiary apiary, CancellationToken cancellationToken = default)
    {
        await _context.Apiaries.AddAsync(apiary, cancellationToken);
    }

    public void Update(Apiary apiary)
    {
        _context.Apiaries.Update(apiary);
    }

    public void Delete(Apiary apiary)
    {
        _context.Apiaries.Remove(apiary);
    }
}
