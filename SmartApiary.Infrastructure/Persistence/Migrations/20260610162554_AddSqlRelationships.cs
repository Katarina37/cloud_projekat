using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartApiary.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddSqlRelationships : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddForeignKey(
                name: "FK_Apiaries_Users_BeekeeperId",
                table: "Apiaries",
                column: "BeekeeperId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Crops_Parcels_ParcelId",
                table: "Crops",
                column: "ParcelId",
                principalTable: "Parcels",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Devices_Hives_HiveId",
                table: "Devices",
                column: "HiveId",
                principalTable: "Hives",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_HiveInspectionRecords_Hives_HiveId",
                table: "HiveInspectionRecords",
                column: "HiveId",
                principalTable: "Hives",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Hives_Apiaries_ApiaryId",
                table: "Hives",
                column: "ApiaryId",
                principalTable: "Apiaries",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Notifications_Users_UserId",
                table: "Notifications",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Parcels_Users_FarmerId",
                table: "Parcels",
                column: "FarmerId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SprayingAnnouncements_Parcels_ParcelId",
                table: "SprayingAnnouncements",
                column: "ParcelId",
                principalTable: "Parcels",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_TelemetryReadings_Devices_DeviceId",
                table: "TelemetryReadings",
                column: "DeviceId",
                principalTable: "Devices",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TelemetryReadings_Hives_HiveId",
                table: "TelemetryReadings",
                column: "HiveId",
                principalTable: "Hives",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserAlertSettings_Users_UserId",
                table: "UserAlertSettings",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Apiaries_Users_BeekeeperId",
                table: "Apiaries");

            migrationBuilder.DropForeignKey(
                name: "FK_Crops_Parcels_ParcelId",
                table: "Crops");

            migrationBuilder.DropForeignKey(
                name: "FK_Devices_Hives_HiveId",
                table: "Devices");

            migrationBuilder.DropForeignKey(
                name: "FK_HiveInspectionRecords_Hives_HiveId",
                table: "HiveInspectionRecords");

            migrationBuilder.DropForeignKey(
                name: "FK_Hives_Apiaries_ApiaryId",
                table: "Hives");

            migrationBuilder.DropForeignKey(
                name: "FK_Notifications_Users_UserId",
                table: "Notifications");

            migrationBuilder.DropForeignKey(
                name: "FK_Parcels_Users_FarmerId",
                table: "Parcels");

            migrationBuilder.DropForeignKey(
                name: "FK_SprayingAnnouncements_Parcels_ParcelId",
                table: "SprayingAnnouncements");

            migrationBuilder.DropForeignKey(
                name: "FK_TelemetryReadings_Devices_DeviceId",
                table: "TelemetryReadings");

            migrationBuilder.DropForeignKey(
                name: "FK_TelemetryReadings_Hives_HiveId",
                table: "TelemetryReadings");

            migrationBuilder.DropForeignKey(
                name: "FK_UserAlertSettings_Users_UserId",
                table: "UserAlertSettings");

        }
    }
}
