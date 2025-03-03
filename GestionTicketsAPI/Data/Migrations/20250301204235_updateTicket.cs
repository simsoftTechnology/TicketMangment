using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GestionTicketsAPI.Migrations
{
    /// <inheritdoc />
    public partial class updateTicket : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DeveloppeurId",
                table: "Tickets",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Tickets_DeveloppeurId",
                table: "Tickets",
                column: "DeveloppeurId");

            migrationBuilder.AddForeignKey(
                name: "FK_Tickets_Users_DeveloppeurId",
                table: "Tickets",
                column: "DeveloppeurId",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Tickets_Users_DeveloppeurId",
                table: "Tickets");

            migrationBuilder.DropIndex(
                name: "IX_Tickets_DeveloppeurId",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "DeveloppeurId",
                table: "Tickets");
        }
    }
}
