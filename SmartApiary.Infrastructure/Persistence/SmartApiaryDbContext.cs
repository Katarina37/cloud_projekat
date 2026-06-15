// Ovde su sve SQL tabele koje koristi aplikacija.
// Specifikacija - glavni podaci se cuvaju u Azure SQL bazi.

using Microsoft.EntityFrameworkCore;
using SmartApiary.Domain.Models;

namespace SmartApiary.Infrastructure.Persistence;

public class SmartApiaryDbContext : DbContext
{
    public SmartApiaryDbContext(DbContextOptions<SmartApiaryDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();

    public DbSet<Apiary> Apiaries => Set<Apiary>();

    public DbSet<Hive> Hives => Set<Hive>();

    public DbSet<Device> Devices => Set<Device>();

    public DbSet<HiveInspectionRecord> HiveInspectionRecords => Set<HiveInspectionRecord>();

    public DbSet<Parcel> Parcels => Set<Parcel>();

    public DbSet<Crop> Crops => Set<Crop>();

    public DbSet<SprayingAnnouncement> SprayingAnnouncements => Set<SprayingAnnouncement>();

    public DbSet<Notification> Notifications => Set<Notification>();

    public DbSet<UserAlertSettings> UserAlertSettings => Set<UserAlertSettings>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(SmartApiaryDbContext).Assembly);

        base.OnModelCreating(modelBuilder);
    }
}
