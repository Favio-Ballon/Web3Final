using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace sistemaPadronElectoral.Migrations
{
    /// <inheritdoc />
    public partial class Recinto : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Recinto",
                table: "Votante",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Recinto",
                table: "Votante");
        }
    }
}
