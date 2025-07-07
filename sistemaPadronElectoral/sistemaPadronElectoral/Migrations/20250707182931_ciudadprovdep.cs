using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace sistemaPadronElectoral.Migrations
{
    /// <inheritdoc />
    public partial class ciudadprovdep : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Ciudad",
                table: "Votante",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Departamento",
                table: "Votante",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Provincia",
                table: "Votante",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Ciudad",
                table: "Votante");

            migrationBuilder.DropColumn(
                name: "Departamento",
                table: "Votante");

            migrationBuilder.DropColumn(
                name: "Provincia",
                table: "Votante");
        }
    }
}
