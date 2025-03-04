using GestionTicketsAPI.Entities;
using GestionTicketsAPI.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace GestionTicketsAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StatutDesTicketsController : ControllerBase
    {
        private readonly IStatutDesTicketService _service;
        public StatutDesTicketsController(IStatutDesTicketService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<StatutDesTicket>>> GetStatuts()
        {
            var statuts = await _service.GetAllStatutsAsync();
            return Ok(statuts);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<StatutDesTicket>> GetStatut(int id)
        {
            var statut = await _service.GetStatutByIdAsync(id);
            if (statut == null)
                return NotFound();
            return Ok(statut);
        }

        [HttpPost]
        public async Task<ActionResult<StatutDesTicket>> CreateStatut([FromBody] StatutDesTicket statut)
        {
            var createdStatut = await _service.CreateStatutAsync(statut);
            return CreatedAtAction(nameof(GetStatut), new { id = createdStatut.Id }, createdStatut);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateStatut(int id, [FromBody] StatutDesTicket statut)
        {
            if (id != statut.Id)
                return BadRequest();
            await _service.UpdateStatutAsync(statut);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStatut(int id)
        {
            await _service.DeleteStatutAsync(id);
            return NoContent();
        }
    }
}
