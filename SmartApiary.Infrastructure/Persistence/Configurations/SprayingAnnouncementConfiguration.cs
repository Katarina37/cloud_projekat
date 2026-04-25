using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartApiary.Domain.Models;

namespace SmartApiary.Infrastructure.Persistence.Configurations;

public class SprayingAnnouncementConfiguration : IEntityTypeConfiguration<SprayingAnnouncement>
{
    public void Configure(EntityTypeBuilder<SprayingAnnouncement> builder)
    {
        builder.ToTable("SprayingAnnouncements");

        builder.HasKey(announcement => announcement.Id);

        builder.Property(announcement => announcement.PreparationType)
            .HasMaxLength(200);

        builder.Property(announcement => announcement.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(32);

        builder.HasIndex(announcement => announcement.ParcelId);

        builder.HasIndex(announcement => announcement.StartTime);
    }
}
