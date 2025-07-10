using Microsoft.EntityFrameworkCore;

namespace SistemaPadronElectoral.data
{
    public class SistemaPadronElectoralContext : DbContext
    {
        public DbSet<SistemaPadronElectoral.Models.Votante> Votante { get; set; } = default!;

        public SistemaPadronElectoralContext(DbContextOptions<SistemaPadronElectoralContext> options)
            : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<SistemaPadronElectoral.Models.Votante>()
                .Property(v => v.Latitud)
                .HasPrecision(9, 6);
            modelBuilder.Entity<SistemaPadronElectoral.Models.Votante>()
                .Property(v => v.Longitud)
                .HasPrecision(9, 6);
        }
    }
}
