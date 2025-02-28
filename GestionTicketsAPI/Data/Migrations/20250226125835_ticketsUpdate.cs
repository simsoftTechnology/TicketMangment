using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GestionTicketsAPI.Migrations
{
    /// <inheritdoc />
    public partial class ticketsUpdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CategorieProblemeId",
                table: "Tickets",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Tickets_CategorieProblemeId",
                table: "Tickets",
                column: "CategorieProblemeId");

            migrationBuilder.AddForeignKey(
                name: "FK_Tickets_CategorieProblemes_CategorieProblemeId",
                table: "Tickets",
                column: "CategorieProblemeId",
                principalTable: "CategorieProblemes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Tickets_CategorieProblemes_CategorieProblemeId",
                table: "Tickets");

            migrationBuilder.DropIndex(
                name: "IX_Tickets_CategorieProblemeId",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "CategorieProblemeId",
                table: "Tickets");
        }
    }
}
