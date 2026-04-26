using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartApiary.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddHiveInspectionRecords : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "HiveInspectionRecords",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    HiveId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FramesWithHoney = table.Column<int>(type: "int", nullable: false),
                    BroodFrames = table.Column<int>(type: "int", nullable: false),
                    QueenPresent = table.Column<bool>(type: "bit", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HiveInspectionRecords", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_HiveInspectionRecords_Date",
                table: "HiveInspectionRecords",
                column: "Date");

            migrationBuilder.CreateIndex(
                name: "IX_HiveInspectionRecords_HiveId",
                table: "HiveInspectionRecords",
                column: "HiveId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "HiveInspectionRecords");
        }
    }
}
