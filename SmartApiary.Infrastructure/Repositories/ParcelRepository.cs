using Microsoft.EntityFrameworkCore;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Models;
using SmartApiary.Domain.ValueObjects;
using SmartApiary.Infrastructure.Persistence;

namespace SmartApiary.Infrastructure.Repositories;

public class ParcelRepository : IParcelRepository
{
    private const double EarthRadiusKm = 6371d;
    private readonly SmartApiaryDbContext _context;

    public ParcelRepository(SmartApiaryDbContext context)
    {
        _context = context;
    }

    public Task<Parcel?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return _context.Parcels.FirstOrDefaultAsync(parcel => parcel.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<Parcel>> GetByFarmerIdAsync(
        Guid farmerId,
        CancellationToken cancellationToken = default)
    {
        return await _context.Parcels
            .Where(parcel => parcel.FarmerId == farmerId)
            .OrderBy(parcel => parcel.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Parcel>> FindWithinRadiusAsync(
        GeoLocation location,
        double radiusKm,
        CancellationToken cancellationToken = default)
    {
        var parcels = await _context.Parcels.ToListAsync(cancellationToken);

        return parcels
            .Where(parcel => CalculateDistanceKm(location, parcel.Location) <= radiusKm)
            .ToList();
    }

    public async Task AddAsync(Parcel parcel, CancellationToken cancellationToken = default)
    {
        await _context.Parcels.AddAsync(parcel, cancellationToken);
    }

    public void Update(Parcel parcel)
    {
        _context.Parcels.Update(parcel);
    }

    public void Delete(Parcel parcel)
    {
        _context.Parcels.Remove(parcel);
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
