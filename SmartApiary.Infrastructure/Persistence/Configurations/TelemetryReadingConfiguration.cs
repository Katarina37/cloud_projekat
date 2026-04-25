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

        builder.HasIndex(reading => new { reading.HiveId, reading.Timestamp });

        builder.HasIndex(reading => reading.DeviceId);
    }
}
