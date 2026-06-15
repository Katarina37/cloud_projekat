// Kako se Apiary cuva u SQL tabeli.

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NetTopologySuite.Geometries;
using SmartApiary.Domain.Models;

namespace SmartApiary.Infrastructure.Persistence.Configurations;

public class ApiaryConfiguration : IEntityTypeConfiguration<Apiary>
{
    public void Configure(EntityTypeBuilder<Apiary> builder)
    {
        builder.ToTable("Apiaries");

        builder.HasKey(apiary => apiary.Id);

        builder.Property(apiary => apiary.Name)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(apiary => apiary.TerrainDescription)
            .HasMaxLength(1000);

        builder.Property(apiary => apiary.ImageUrl)
            .HasMaxLength(2048);

        builder.Property(apiary => apiary.ThumbnailUrl)
            .HasMaxLength(2048);

        builder.OwnsOne(apiary => apiary.Location, location =>
        {
            location.Property(value => value.Latitude)
                .HasColumnName("Latitude")
                .IsRequired();

            location.Property(value => value.Longitude)
                .HasColumnName("Longitude")
                .IsRequired();
        });

        builder.Navigation(apiary => apiary.Location)
            .IsRequired();

        builder.Property<Point>("LocationPoint")
            .HasColumnType("geography")
            .HasComputedColumnSql(
                "geography::Point([Latitude], [Longitude], 4326)",
                stored: true);

        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(apiary => apiary.BeekeeperId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(apiary => apiary.BeekeeperId);
    }
}
