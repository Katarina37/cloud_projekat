// Kako se TelemetryReading cuva u SQL tabeli.

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartApiary.Domain.Models;

namespace SmartApiary.Infrastructure.Persistence.Configurations;

public class TelemetryReadingConfiguration : IEntityTypeConfiguration<TelemetryReading>
{
    public void Configure(EntityTypeBuilder<TelemetryReading> builder)
    {
        builder.ToTable("TelemetryReadings");

        builder.HasKey(reading => reading.Id);

        builder.HasOne<Hive>()
            .WithMany()
            .HasForeignKey(reading => reading.HiveId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne<Device>()
            .WithMany()
            .HasForeignKey(reading => reading.DeviceId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(reading => new { reading.HiveId, reading.Timestamp });

        builder.HasIndex(reading => reading.DeviceId);
    }
}
