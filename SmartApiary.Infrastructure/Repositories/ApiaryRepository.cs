using Microsoft.EntityFrameworkCore;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Models;
using SmartApiary.Domain.ValueObjects;
using SmartApiary.Infrastructure.Persistence;

namespace SmartApiary.Infrastructure.Repositories;

public class ApiaryRepository : IApiaryRepository
{
    private const double EarthRadiusKm = 6371d;

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
        var apiaries = await _context.Apiaries.ToListAsync(cancellationToken);

        return apiaries
            .Where(apiary => CalculateDistanceKm(location, apiary.Location) <= radiusKm)
            .ToList();
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

    private static double CalculateDistanceKm(GeoLocation first, GeoLocation second)
    {
        var latitudeDelta = ToRadians(second.Latitude - first.Latitude);
        var longitudeDelta = ToRadians(second.Longitude - first.Longitude);

        var firstLatitude = ToRadians(first.Latitude);
        var secondLatitude = ToRadians(second.Latitude);

        var haversine =
            Math.Sin(latitudeDelta / 2) * Math.Sin(latitudeDelta / 2) +
            Math.Cos(firstLatitude) * Math.Cos(secondLatitude) *
            Math.Sin(longitudeDelta / 2) * Math.Sin(longitudeDelta / 2);

        var centralAngle = 2 * Math.Atan2(Math.Sqrt(haversine), Math.Sqrt(1 - haversine));

        return EarthRadiusKm * centralAngle;
    }

    private static double ToRadians(double degrees)
    {
        return degrees * Math.PI / 180d;
    }
}
