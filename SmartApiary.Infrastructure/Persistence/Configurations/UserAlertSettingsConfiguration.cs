// Kako se UserAlertSettings cuva u SQL tabeli.

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartApiary.Domain.Models;

namespace SmartApiary.Infrastructure.Persistence.Configurations;

public class UserAlertSettingsConfiguration : IEntityTypeConfiguration<UserAlertSettings>
{
    public void Configure(EntityTypeBuilder<UserAlertSettings> builder)
    {
        builder.ToTable("UserAlertSettings");

        builder.HasKey(settings => settings.Id);

        builder.HasOne<User>()
            .WithOne()
            .HasForeignKey<UserAlertSettings>(settings => settings.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(settings => settings.UserId)
            .IsUnique();
    }
}
