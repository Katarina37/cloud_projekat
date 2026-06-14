using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartApiary.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RemoveSqlTelemetryReadings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TelemetryReadings");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TelemetryReadings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BatteryPercent = table.Column<double>(type: "float", nullable: false),
                    DeviceId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    HiveId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    HumidityPercent = table.Column<double>(type: "float", nullable: false),
                    TemperatureCelsius = table.Column<double>(type: "float", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false),
                    WeightKg = table.Column<double>(type: "float", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TelemetryReadings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TelemetryReadings_Devices_DeviceId",
                        column: x => x.DeviceId,
                        principalTable: "Devices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TelemetryReadings_Hives_HiveId",
                        column: x => x.HiveId,
                        principalTable: "Hives",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TelemetryReadings_DeviceId",
                table: "TelemetryReadings",
                column: "DeviceId");

            migrationBuilder.CreateIndex(
                name: "IX_TelemetryReadings_HiveId_Timestamp",
                table: "TelemetryReadings",
                columns: new[] { "HiveId", "Timestamp" });
        }
    }
}
