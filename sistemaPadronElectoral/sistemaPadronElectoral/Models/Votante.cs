using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaPadronElectoral.Models
{
    public class Votante
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid Codigo { get; set; }
        public int Ci { get; set; }
        public string Nombre { get; set; }
        public string Apellido { get; set; }
        public string Direccion { get; set; }
        public string Foto { get; set; }
        public string CiReverso { get; set; }
        public string CiAnverso { get; set; }
        public DateOnly FechaNacimiento { get; set; }
        public decimal Latitud { get; set; }

        public decimal Longitud { get; set; }
        public string Departamento { get; set; }
        public string Ciudad { get; set; }
        public string Provincia { get; set; }

        public Votante()
        {
            Codigo = Guid.NewGuid();
        }
    }
}
