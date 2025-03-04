using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GestionTicketsAPI.Migrations
{
    /// <inheritdoc />
    public partial class RemoveClientFromProjet : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {

            migrationBuilder.DropCheckConstraint(
                    name: "CK_Projet_Association",
                    table: "Projets");
            migrationBuilder.DropColumn(
                name: "ClientId",
                table: "Projets");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Role",
                table: "ProjetUser",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<int>(
                name: "ClientId",
                table: "Projets",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Projets_ClientId",
                table: "Projets",
                column: "ClientId");

            migrationBuilder.AddForeignKey(
                name: "FK_Projets_Users_ClientId",
                table: "Projets",
                column: "ClientId",
                principalTable: "Users",
                principalColumn: "Id");
        }
    }
}
