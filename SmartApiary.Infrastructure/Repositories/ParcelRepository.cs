// SQL citanje i upis za Parcel.

using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Models;
using SmartApiary.Domain.ValueObjects;
using SmartApiary.Infrastructure.Persistence;

namespace SmartApiary.Infrastructure.Repositories;

public class ParcelRepository : IParcelRepository
{
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
        // Geography tacka za SQL upit.
        var searchPoint = new Point(location.Longitude, location.Latitude)
        {
            SRID = 4326
        };
        var radiusMeters = radiusKm * 1000d;

        // SQL racuna metre, zato km pretvaramo u metre.
        return await _context.Parcels
            .Where(parcel =>
                EF.Property<Point>(parcel, "LocationPoint").Distance(searchPoint) <= radiusMeters)
            .ToListAsync(cancellationToken);
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
}
