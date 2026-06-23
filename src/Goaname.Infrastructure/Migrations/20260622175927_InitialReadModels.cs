using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Goaname.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialReadModels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BetHistory",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    MarketId = table.Column<Guid>(type: "uuid", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric", nullable: false),
                    SelectedOutcome = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    PotentialPayout = table.Column<decimal>(type: "numeric", nullable: false),
                    OddsAtPlacement = table.Column<decimal>(type: "numeric", nullable: false),
                    MarketTitle = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    SettlementAmount = table.Column<decimal>(type: "numeric", nullable: true),
                    PlacedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    SettledAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BetHistory", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Markets",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    TradingEndsAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    TotalVolume = table.Column<decimal>(type: "numeric", nullable: false),
                    UniqueTraders = table.Column<int>(type: "integer", nullable: false),
                    IsPinned = table.Column<bool>(type: "boolean", nullable: false),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false),
                    IsVisible = table.Column<bool>(type: "boolean", nullable: false),
                    YesBettingEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    NoBettingEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    DataPayload = table.Column<string>(type: "jsonb", nullable: false),
                    LastUpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Version = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Markets", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BetHistory_TenantId_MarketId_PlacedAt",
                table: "BetHistory",
                columns: new[] { "TenantId", "MarketId", "PlacedAt" },
                descending: new[] { false, false, true });

            migrationBuilder.CreateIndex(
                name: "IX_BetHistory_TenantId_UserId_PlacedAt",
                table: "BetHistory",
                columns: new[] { "TenantId", "UserId", "PlacedAt" },
                descending: new[] { false, false, true });

            migrationBuilder.CreateIndex(
                name: "IX_Markets_TenantId",
                table: "Markets",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Markets_TenantId_Status_TotalVolume",
                table: "Markets",
                columns: new[] { "TenantId", "Status", "TotalVolume" },
                descending: new[] { false, false, true });

            migrationBuilder.CreateIndex(
                name: "IX_Markets_TenantId_Status_TradingEndsAt",
                table: "Markets",
                columns: new[] { "TenantId", "Status", "TradingEndsAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BetHistory");

            migrationBuilder.DropTable(
                name: "Markets");
        }
    }
}
