using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GestionTicketsAPI.Migrations
{
    /// <inheritdoc />
    public partial class ProjetUpdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {


            migrationBuilder.CreateIndex(
                name: "IX_Projets_ChefProjetId",
                table: "Projets",
                column: "ChefProjetId");

            migrationBuilder.AddForeignKey(
                name: "FK_Projets_Users_ChefProjetId",
                table: "Projets",
                column: "ChefProjetId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Tickets_Priorities_PriorityId",
                table: "Tickets",
                column: "PriorityId",
                principalTable: "Priorities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Tickets_Validation_ValidationId",
                table: "Tickets",
                column: "ValidationId",
                principalTable: "Validation",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Projets_Users_ChefProjetId",
                table: "Projets");

            migrationBuilder.DropForeignKey(
                name: "FK_Tickets_Priorities_PriorityId",
                table: "Tickets");

            migrationBuilder.DropForeignKey(
                name: "FK_Tickets_Validation_ValidationId",
                table: "Tickets");

            migrationBuilder.DropIndex(
                name: "IX_Projets_ChefProjetId",
                table: "Projets");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Validation",
                table: "Validation");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Priorities",
                table: "Priorities");

            migrationBuilder.DropColumn(
                name: "ChefProjetId",
                table: "Projets");

            migrationBuilder.RenameTable(
                name: "Validation",
                newName: "Validations");


            migrationBuilder.UpdateData(
                table: "Tickets",
                keyColumn: "Attachments",
                keyValue: null,
                column: "Attachments",
                value: "");

            migrationBuilder.AlterColumn<string>(
                name: "Attachments",
                table: "Tickets",
                type: "longtext",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");



            migrationBuilder.AddForeignKey(
                name: "FK_Tickets_Validations_ValidationId",
                table: "Tickets",
                column: "ValidationId",
                principalTable: "Validations",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
