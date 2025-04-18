using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GestionTicketsAPI.Migrations
{
    /// <inheritdoc />
    public partial class addValidationReason : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ValidationReason",
                table: "Tickets",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ValidationReason",
                table: "Tickets");
        }
    }
}
