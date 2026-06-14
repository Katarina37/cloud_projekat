using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartApiary.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddSprayingCompletionDetails : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ActualStartTime",
                table: "SprayingAnnouncements",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CropId",
                table: "SprayingAnnouncements",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Note",
                table: "SprayingAnnouncements",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_SprayingAnnouncements_CropId",
                table: "SprayingAnnouncements",
                column: "CropId");

            migrationBuilder.AddForeignKey(
                name: "FK_SprayingAnnouncements_Crops_CropId",
                table: "SprayingAnnouncements",
                column: "CropId",
                principalTable: "Crops",
                principalColumn: "Id",
                onDelete: ReferentialAction.NoAction);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SprayingAnnouncements_Crops_CropId",
                table: "SprayingAnnouncements");

            migrationBuilder.DropIndex(
                name: "IX_SprayingAnnouncements_CropId",
                table: "SprayingAnnouncements");

            migrationBuilder.DropColumn(
                name: "ActualStartTime",
                table: "SprayingAnnouncements");

            migrationBuilder.DropColumn(
                name: "CropId",
                table: "SprayingAnnouncements");

            migrationBuilder.DropColumn(
                name: "Note",
                table: "SprayingAnnouncements");
        }
    }
}
