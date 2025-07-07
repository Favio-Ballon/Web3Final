using System.ComponentModel.DataAnnotations;

namespace sistemaPadronElectoral.Dtos
{
    public class VotanteDto
    {
        [Required(ErrorMessage = "El campo CI es obligatorio.")]
        public int Ci { get; set; }
        [Required(ErrorMessage = "El campo Nombre es obligatorio.")]
        public string Nombre { get; set; }
        [Required(ErrorMessage = "El campo Apellido es obligatorio.")]
        public string Apellido { get; set; }
        [Required(ErrorMessage = "El campo Dirección es obligatorio.")]
        public string Direccion { get; set; }
        [Required(ErrorMessage = "La foto es obligatoria.")]
        public IFormFile Foto { get; set; }
        [Required(ErrorMessage = "El CI reverso es obligatorio.")]
        public IFormFile CiReverso { get; set; }
        [Required(ErrorMessage = "El CI anverso es obligatorio.")]
        public IFormFile CiAnverso { get; set; }
        [Required(ErrorMessage = "La fecha de nacimiento es obligatoria.")]
        public DateOnly FechaNacimiento { get; set; }
        [Required (ErrorMessage = "La latitud es obligatoria.")]
        public decimal Latitud { get; set; }
        [Required(ErrorMessage = "La longitud es obligatoria.")]
        public decimal Longitud { get; set; }
        [Required(ErrorMessage = "El departamento es obligatorio.")]
        public string Departamento { get; set; }
        [Required(ErrorMessage = "La ciudad es obligatoria.")]
        public string Ciudad { get; set; }
        [Required(ErrorMessage = "La provincia es obligatoria.")]
        public string Provincia { get; set; }

        }   

}
