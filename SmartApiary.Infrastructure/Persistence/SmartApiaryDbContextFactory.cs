using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace SmartApiary.Infrastructure.Persistence;

public class SmartApiaryDbContextFactory : IDesignTimeDbContextFactory<SmartApiaryDbContext>
{
    public SmartApiaryDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<SmartApiaryDbContext>();
        optionsBuilder.UseSqlServer("Server=(localdb)\\mssqllocaldb;Database=SmartApiary;Trusted_Connection=True;");

        return new SmartApiaryDbContext(optionsBuilder.Options);
    }
}