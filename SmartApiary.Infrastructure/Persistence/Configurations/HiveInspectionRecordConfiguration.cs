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

        builder.Property(record => record.Notes)
            .HasMaxLength(1000);

        builder.HasIndex(record => record.HiveId);

        builder.HasIndex(record => record.Date);
    }
}
