using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartApiary.Domain.Models;

namespace SmartApiary.Infrastructure.Persistence.Configurations;

public class CropConfiguration : IEntityTypeConfiguration<Crop>
{
    public void Configure(EntityTypeBuilder<Crop> builder)
    {
        builder.ToTable("Crops");

        builder.HasKey(crop => crop.Id);

        builder.Property(crop => crop.Name)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(crop => crop.Notes)
            .HasMaxLength(1000);

        builder.HasOne<Parcel>()
            .WithMany()
            .HasForeignKey(crop => crop.ParcelId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(crop => crop.ParcelId);
    }
}
