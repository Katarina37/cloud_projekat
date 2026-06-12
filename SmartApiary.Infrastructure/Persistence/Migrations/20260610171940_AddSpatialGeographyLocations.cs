using Microsoft.EntityFrameworkCore.Migrations;
using NetTopologySuite.Geometries;

#nullable disable

namespace SmartApiary.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddSpatialGeographyLocations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Point>(
                name: "LocationPoint",
                table: "Parcels",
                type: "geography",
                nullable: true,
                computedColumnSql: "geography::Point([Latitude], [Longitude], 4326)",
                stored: true);

            migrationBuilder.AddColumn<Point>(
                name: "LocationPoint",
                table: "Apiaries",
                type: "geography",
                nullable: true,
                computedColumnSql: "geography::Point([Latitude], [Longitude], 4326)",
                stored: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LocationPoint",
                table: "Parcels");

            migrationBuilder.DropColumn(
                name: "LocationPoint",
                table: "Apiaries");
        }
    }
}
