using System.Threading.Tasks;
using GestionTicketsAPI.DTOs;
using GestionTicketsAPI.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace GestionTicketsAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ContratController : ControllerBase
    {
        private readonly IContratService _contratService;
        public ContratController(IContratService contratService)
        {
            _contratService = contratService;
        }

        // GET api/contrat/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ContratDto>> GetContrat(int id)
        {
            var contrat = await _contratService.GetContratByIdAsync(id);
            if (contrat == null)
                return NotFound();
            return Ok(contrat);
        }

        // POST api/contrat
        [HttpPost]
        public async Task<ActionResult<ContratDto>> AddContrat([FromBody] ContratDto contratDto)
        {
            var createdContrat = await _contratService.AddContratAsync(contratDto);
            return CreatedAtAction(nameof(GetContrat), new { id = createdContrat.Id }, createdContrat);
        }

        // PUT api/contrat/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateContrat(int id, [FromBody] ContratDto contratDto)
        {
            var result = await _contratService.UpdateContratAsync(id, contratDto);
            if (!result)
                return NotFound();
            return NoContent();
        }

        // DELETE api/contrat/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteContrat(int id)
        {
            var result = await _contratService.DeleteContratAsync(id);
            if (!result)
                return NotFound();
            return NoContent();
        }
    }
}
