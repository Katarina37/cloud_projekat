// Pomocni Web API servis: DevelopmentUserSeeder.

using Microsoft.EntityFrameworkCore;
using SmartApiary.Application.Interfaces.Services;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.Models;
using SmartApiary.Infrastructure.Persistence;

namespace SmartApiary.WebApi.Services;

public static class DevelopmentUserSeeder
{
    private const string DefaultAdminEmail = "admin@smartapiary.local";

    public static async Task SeedDevelopmentAdminAsync(this WebApplication app)
    {
        if (!app.Environment.IsDevelopment())
        {
            return;
        }

        using var scope = app.Services.CreateScope();
        var services = scope.ServiceProvider;
        var configuration = services.GetRequiredService<IConfiguration>();
        var logger = services.GetRequiredService<ILoggerFactory>().CreateLogger(nameof(DevelopmentUserSeeder));
        var dbContext = services.GetRequiredService<SmartApiaryDbContext>();
        var passwordHasher = services.GetRequiredService<IPasswordHasher>();

        if (await dbContext.Users.AnyAsync(user => user.Role == UserRole.Admin && user.IsActive))
        {
            return;
        }

        var email = configuration["DevelopmentAdmin:Email"]?.Trim();
        if (string.IsNullOrWhiteSpace(email))
        {
            email = DefaultAdminEmail;
        }

        var password = configuration["DevelopmentAdmin:Password"];
        if (string.IsNullOrWhiteSpace(password))
        {
            logger.LogWarning(
                "Development admin was not seeded because DevelopmentAdmin:Password is not configured. "
                + "Set it with User Secrets or an environment variable.");
            return;
        }

        var passwordHash = passwordHasher.Hash(password);
        var existingAdmin = await dbContext.Users.FirstOrDefaultAsync(user => user.Email == email);

        if (existingAdmin is null)
        {
            existingAdmin = new User(
                "Development",
                "Admin",
                email,
                "+387000000",
                UserRole.Admin);

            existingAdmin.Activate(passwordHash);
            await dbContext.Users.AddAsync(existingAdmin);
        }
        else if (existingAdmin.Role != UserRole.Admin)
        {
            logger.LogWarning(
                "Development admin could not be seeded because {Email} already exists with role {Role}.",
                email,
                existingAdmin.Role);
            return;
        }
        else
        {
            existingAdmin.Activate(passwordHash);
        }

        await dbContext.SaveChangesAsync();
        logger.LogInformation(
            "Development admin is ready. Email: {Email}.",
            email);
    }
}
