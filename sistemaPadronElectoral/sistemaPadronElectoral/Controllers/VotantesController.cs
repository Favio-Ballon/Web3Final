using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaPadronElectoral.Models;
using SistemaPadronElectoral.data;
using sistemaPadronElectoral.Dtos;

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
            return await _context.Votante.ToListAsync();
        }

        // GET: api/Votantes/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Votante>> GetVotante(Guid id)
        {
            var votante = await _context.Votante.FindAsync(id);

            if (votante == null)
            {
                return NotFound();
            }

            return votante;
        }

        // PUT: api/Votantes/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutVotante(Guid id, [FromForm] VotanteDto votanteDto)
        {
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
        public async Task<ActionResult<Votante>> PostVotante([FromForm] VotanteDto votanteDto)
        {
            Directory.CreateDirectory(_uploadsFolder);

            var votante = new Votante
            {
                Ci = votanteDto.Ci,
                Nombre = votanteDto.Nombre,
                Apellido = votanteDto.Apellido,
                Direccion = votanteDto.Direccion,
                FechaNacimiento = votanteDto.FechaNacimiento,
                Latitud = votanteDto.Latitud,
                Longitud = votanteDto.Longitud
            };

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

        // DELETE: api/Votantes/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVotante(Guid id)
        {
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
