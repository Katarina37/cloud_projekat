// Kako se HiveInspectionRecord cuva u SQL tabeli.

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartApiary.Domain.Models;

namespace SmartApiary.Infrastructure.Persistence.Configurations;

public class HiveInspectionRecordConfiguration : IEntityTypeConfiguration<HiveInspectionRecord>
{
    public void Configure(EntityTypeBuilder<HiveInspectionRecord> builder)
    {
        builder.ToTable("HiveInspectionRecords");

        builder.HasKey(record => record.Id);

        builder.Property(record => record.BottomBoardColor)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(record => record.HoneyQuantityKg)
            .HasPrecision(18, 2);

        builder.Property(record => record.Notes)
            .HasMaxLength(1000);

        builder.HasOne<Hive>()
            .WithMany()
            .HasForeignKey(record => record.HiveId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(record => record.HiveId);

        builder.HasIndex(record => record.Date);
    }
}
