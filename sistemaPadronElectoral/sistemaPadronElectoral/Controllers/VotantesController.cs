using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using sistemaPadronElectoral.Dtos;
using SistemaPadronElectoral.data;
using SistemaPadronElectoral.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace sistemaPadronElectoral.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VotantesController : ControllerBase
    {
        private readonly SistemaPadronElectoralContext _context;
        private readonly string _uploadsFolder = Path.Combine("wwwroot", "uploads");

        public VotantesController(SistemaPadronElectoralContext context)
        {
            _context = context;
        }

        // GET: api/Votantes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Votante>>> GetVotante()
        {
            Console.WriteLine($"[LOG] GET /api/votantes at {DateTime.UtcNow}");
            return await _context.Votante.ToListAsync();
        }

        // GET: api/Votantes/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Votante>> GetVotante(Guid id)
        {
            Console.WriteLine($"[LOG] GET /api/votantes/{{id}} at {DateTime.UtcNow}");
            var votante = await _context.Votante.FindAsync(id);

            if (votante == null)
            {
                return NotFound();
            }

            return votante;
        }

        // GET: api/Votantes/estado/{ci}
        [HttpGet("estado/{ci}")]
        [AllowAnonymous]
        public async Task<ActionResult<VotanteEstadoPadronDto>> GetEstadoPadron(int ci)
        {
            var votante = await _context.Votante
                .AsNoTracking()
                .FirstOrDefaultAsync(v => v.Ci == ci);

            if (votante == null)
            {
                return NotFound();
            }

            var dto = new VotanteEstadoPadronDto
            {
                Ci = votante.Ci,
                Nombre = votante.Nombre,
                Apellido = votante.Apellido,
                FechaNacimiento = votante.FechaNacimiento,
                Recinto = votante.Recinto.ToString(),
                Departamento = votante.Departamento,
                Ciudad = votante.Ciudad,
                Provincia = votante.Provincia
            };

            return dto;
        }

        // PUT: api/Votantes/5
        [HttpPut("{id}")]
        [Authorize(Roles = "admin_padron")]
        public async Task<IActionResult> PutVotante(Guid id, [FromForm] VotanteUpdateDto votanteDto)
        {
            Console.WriteLine($"[LOG] PUT /api/votantes/{{id}} at {DateTime.UtcNow}");
            var votante = await _context.Votante.FindAsync(id);
            if (votante == null)
            {
                return NotFound();
            }

            votante.Ci = votanteDto.Ci;
            votante.Nombre = votanteDto.Nombre;
            votante.Apellido = votanteDto.Apellido;
            votante.Direccion = votanteDto.Direccion;
            votante.FechaNacimiento = votanteDto.FechaNacimiento;
            votante.Latitud = votanteDto.Latitud;
            votante.Longitud = votanteDto.Longitud;
            votante.Departamento = votanteDto.Departamento;
            votante.Ciudad = votanteDto.Ciudad;
            votante.Provincia = votanteDto.Provincia;

            Directory.CreateDirectory(_uploadsFolder);

            if (votanteDto.Foto != null)
            {
                var fotoPath = Path.Combine(_uploadsFolder, Guid.NewGuid() + Path.GetExtension(votanteDto.Foto.FileName));
                using (var stream = new FileStream(fotoPath, FileMode.Create))
                {
                    await votanteDto.Foto.CopyToAsync(stream);
                }
                votante.Foto = fotoPath.Replace("wwwroot", string.Empty).Replace("\\", "/");
            }
            if (votanteDto.CiReverso != null)
            {
                var ciReversoPath = Path.Combine(_uploadsFolder, Guid.NewGuid() + Path.GetExtension(votanteDto.CiReverso.FileName));
                using (var stream = new FileStream(ciReversoPath, FileMode.Create))
                {
                    await votanteDto.CiReverso.CopyToAsync(stream);
                }
                votante.CiReverso = ciReversoPath.Replace("wwwroot", string.Empty).Replace("\\", "/");
            }
            if (votanteDto.CiAnverso != null)
            {
                var ciAnversoPath = Path.Combine(_uploadsFolder, Guid.NewGuid() + Path.GetExtension(votanteDto.CiAnverso.FileName));
                using (var stream = new FileStream(ciAnversoPath, FileMode.Create))
                {
                    await votanteDto.CiAnverso.CopyToAsync(stream);
                }
                votante.CiAnverso = ciAnversoPath.Replace("wwwroot", string.Empty).Replace("\\", "/");
            }

            _context.Entry(votante).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!VotanteExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Votantes
        [HttpPost]
        [Authorize(Roles = "admin_padron")]
        public async Task<ActionResult<Votante>> PostVotante([FromForm] VotanteDto votanteDto)
        {
            Console.WriteLine($"[LOG] POST /api/votantes at {DateTime.UtcNow}");
            Directory.CreateDirectory(_uploadsFolder);

            var votante = new Votante
            {
                Ci = votanteDto.Ci,
                Nombre = votanteDto.Nombre,
                Apellido = votanteDto.Apellido,
                Direccion = votanteDto.Direccion,
                FechaNacimiento = votanteDto.FechaNacimiento,
                Latitud = votanteDto.Latitud,
                Longitud = votanteDto.Longitud,
                Departamento = votanteDto.Departamento ?? " ",
                Ciudad = votanteDto.Ciudad ?? " ",
                Provincia = votanteDto.Provincia ?? " ",
                Recinto = votanteDto.Recinto
            };



            //console. votante y votanteDto
            Console.WriteLine($"[LOG] Votante: {votante.Recinto},|| {votanteDto.Recinto}");


            if (votanteDto.Foto != null)
            {
                var fotoPath = Path.Combine(_uploadsFolder, Guid.NewGuid() + Path.GetExtension(votanteDto.Foto.FileName));
                using (var stream = new FileStream(fotoPath, FileMode.Create))
                {
                    await votanteDto.Foto.CopyToAsync(stream);
                }
                votante.Foto = fotoPath.Replace("wwwroot", string.Empty).Replace("\\", "/");
            }
            if (votanteDto.CiReverso != null)
            {
                var ciReversoPath = Path.Combine(_uploadsFolder, Guid.NewGuid() + Path.GetExtension(votanteDto.CiReverso.FileName));
                using (var stream = new FileStream(ciReversoPath, FileMode.Create))
                {
                    await votanteDto.CiReverso.CopyToAsync(stream);
                }
                votante.CiReverso = ciReversoPath.Replace("wwwroot", string.Empty).Replace("\\", "/");
            }
            if (votanteDto.CiAnverso != null)
            {
                var ciAnversoPath = Path.Combine(_uploadsFolder, Guid.NewGuid() + Path.GetExtension(votanteDto.CiAnverso.FileName));
                using (var stream = new FileStream(ciAnversoPath, FileMode.Create))
                {
                    await votanteDto.CiAnverso.CopyToAsync(stream);
                }
                votante.CiAnverso = ciAnversoPath.Replace("wwwroot", string.Empty).Replace("\\", "/");
            }

            _context.Votante.Add(votante);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetVotante", new { id = votante.Codigo }, votante);
        }

        // POST: api/Votantes/filtrar-ubicacion
        [HttpPost("filtrar-ubicacion")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<Votante>>> FiltrarPorUbicacion([FromBody] VotanteFiltroUbicacionDto filtro)
        {
            if (filtro == null)
                return BadRequest("Debe enviar al menos un filtro.");

            IQueryable<Votante> query = _context.Votante.AsQueryable();

            if (!string.IsNullOrWhiteSpace(filtro.Departamento))
            {
                query = query.Where(v => v.Departamento == filtro.Departamento);
            }
            else if (!string.IsNullOrWhiteSpace(filtro.Ciudad))
            {
                query = query.Where(v => v.Ciudad == filtro.Ciudad);
            }
            else if (!string.IsNullOrWhiteSpace(filtro.Provincia))
            {
                query = query.Where(v => v.Provincia == filtro.Provincia);
            }
            else
            {
                return BadRequest("Debe enviar al menos un filtro válido: Departamento, Ciudad o Provincia.");
            }

            var resultado = await query.ToListAsync();
            return Ok(resultado);
        }

        // DELETE: api/Votantes/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "admin_padron")]
        public async Task<IActionResult> DeleteVotante(Guid id)
        {
            Console.WriteLine($"[LOG] DELETE /api/votantes/{{id}} at {DateTime.UtcNow}");
            var votante = await _context.Votante.FindAsync(id);
            if (votante == null)
            {
                return NotFound();
            }

            _context.Votante.Remove(votante);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool VotanteExists(Guid id)
        {
            return _context.Votante.Any(e => e.Codigo == id);
        }
    }
}
