using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NetTopologySuite.Geometries;
using SmartApiary.Domain.Models;

namespace SmartApiary.Infrastructure.Persistence.Configurations;

public class ParcelConfiguration : IEntityTypeConfiguration<Parcel>
{
    public void Configure(EntityTypeBuilder<Parcel> builder)
    {
        builder.ToTable("Parcels");

        builder.HasKey(parcel => parcel.Id);

        builder.Property(parcel => parcel.Name)
            .IsRequired()
            .HasMaxLength(150);

        builder.OwnsOne(parcel => parcel.Location, location =>
        {
            location.Property(value => value.Latitude)
                .HasColumnName("Latitude")
                .IsRequired();

            location.Property(value => value.Longitude)
                .HasColumnName("Longitude")
                .IsRequired();
        });

        builder.Navigation(parcel => parcel.Location)
            .IsRequired();

        builder.Property<Point>("LocationPoint")
            .HasColumnType("geography")
            .HasComputedColumnSql(
                "geography::Point([Latitude], [Longitude], 4326)",
                stored: true);

        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(parcel => parcel.FarmerId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(parcel => parcel.FarmerId);
    }
}
