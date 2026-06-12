using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartApiary.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddMissingInspectionAndSprayingFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "EndTime",
                table: "SprayingAnnouncements",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WeatherSnapshotJson",
                table: "SprayingAnnouncements",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BottomBoardColor",
                table: "HiveInspectionRecords",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "HoneyQuantityKg",
                table: "HiveInspectionRecords",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EndTime",
                table: "SprayingAnnouncements");

            migrationBuilder.DropColumn(
                name: "WeatherSnapshotJson",
                table: "SprayingAnnouncements");

            migrationBuilder.DropColumn(
                name: "BottomBoardColor",
                table: "HiveInspectionRecords");

            migrationBuilder.DropColumn(
                name: "HoneyQuantityKg",
                table: "HiveInspectionRecords");
        }
    }
}
