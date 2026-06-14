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

        builder.HasOne<Parcel>()
            .WithMany()
            .HasForeignKey(announcement => announcement.ParcelId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(announcement => announcement.ParcelId);

        builder.HasIndex(announcement => announcement.StartTime);

        builder.Property(announcement => announcement.ActualStartTime)
            .HasColumnType("datetime2");

        builder.Property(announcement => announcement.ActualEndTime)
            .HasColumnName("EndTime")
            .HasColumnType("datetime2");

        builder.HasOne<Crop>()
            .WithMany()
            .HasForeignKey(announcement => announcement.CropId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasIndex(announcement => announcement.CropId);

        builder.Property(announcement => announcement.CropName)
            .HasMaxLength(500);

        builder.Property(announcement => announcement.Note)
            .HasMaxLength(1000);

        builder.Property(announcement => announcement.WeatherSnapshotJson)
            .HasColumnType("nvarchar(max)");
    }
}
