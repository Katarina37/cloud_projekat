// Ovo EF koristi kada pravimo migracije bez pokrenutog Web API-ja.

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace SmartApiary.Infrastructure.Persistence;

public class SmartApiaryDbContextFactory : IDesignTimeDbContextFactory<SmartApiaryDbContext>
{
    public SmartApiaryDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<SmartApiaryDbContext>();
        optionsBuilder.UseSqlServer(
            "Server=.\\SQLEXPRESS;Database=SmartApiaryDb;Trusted_Connection=True;TrustServerCertificate=True",
            sqlServerOptions => sqlServerOptions.UseNetTopologySuite());

        return new SmartApiaryDbContext(optionsBuilder.Options);
    }
}
