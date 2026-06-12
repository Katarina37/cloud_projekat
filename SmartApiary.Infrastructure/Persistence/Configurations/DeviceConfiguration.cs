using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartApiary.Domain.Models;

namespace SmartApiary.Infrastructure.Persistence.Configurations;

public class DeviceConfiguration : IEntityTypeConfiguration<Device>
{
    public void Configure(EntityTypeBuilder<Device> builder)
    {
        builder.ToTable("Devices");

        builder.HasKey(device => device.Id);

        builder.Property(device => device.SerialNumber)
            .IsRequired()
            .HasMaxLength(128);

        builder.Property(device => device.DeviceIdentifier)
            .HasMaxLength(128);

        builder.Property(device => device.AccessToken)
            .HasMaxLength(256);

        builder.Property(device => device.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(32);

        builder.HasOne<Hive>()
            .WithOne()
            .HasForeignKey<Device>(device => device.HiveId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(device => device.SerialNumber)
            .IsUnique();

        builder.HasIndex(device => device.HiveId)
            .IsUnique();

        builder.HasIndex(device => device.AccessToken)
            .IsUnique()
            .HasFilter("[AccessToken] IS NOT NULL");
    }
}
