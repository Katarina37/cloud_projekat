// Kako se Hive cuva u SQL tabeli.

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartApiary.Domain.Models;

namespace SmartApiary.Infrastructure.Persistence.Configurations;

public class HiveConfiguration : IEntityTypeConfiguration<Hive>
{
    public void Configure(EntityTypeBuilder<Hive> builder)
    {
        builder.ToTable("Hives");

        builder.HasKey(hive => hive.Id);

        builder.Property(hive => hive.Label)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(hive => hive.Type)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(32);

        builder.Property(hive => hive.BoxColor)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(hive => hive.Notes)
            .HasMaxLength(1000);

        builder.HasOne<Apiary>()
            .WithMany()
            .HasForeignKey(hive => hive.ApiaryId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(hive => hive.ApiaryId);
    }
}
