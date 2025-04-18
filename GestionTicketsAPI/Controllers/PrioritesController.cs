using GestionTicketsAPI.Entities;
using GestionTicketsAPI.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace GestionTicketsAPI.Controllers
{
    [ApiController]
    public class PrioritesController : BaseApiController
    {
        private readonly IPrioriteService _prioriteService;

        public PrioritesController(IPrioriteService prioriteService)
        {
            _prioriteService = prioriteService;
        }

        // GET: api/priorites
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Priorite>>> GetAll()
        {
            var priorites = await _prioriteService.GetAllAsync();
            return Ok(priorites);
        }

        // GET: api/priorites/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Priorite>> GetById(int id)
        {
            var priorite = await _prioriteService.GetByIdAsync(id);
            if (priorite == null)
                return NotFound();
            return Ok(priorite);
        }

        // POST: api/priorites
        [HttpPost]
        public async Task<ActionResult<Priorite>> Create(Priorite priorite)
        {
            var created = await _prioriteService.AddAsync(priorite);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        // PUT: api/priorites/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Priorite priorite)
        {
            if (id != priorite.Id)
                return BadRequest("L'ID ne correspond pas.");

            var result = await _prioriteService.UpdateAsync(id, priorite);
            if (!result)
                return NotFound();
            return NoContent();
        }

        // DELETE: api/priorites/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _prioriteService.DeleteAsync(id);
            if (!result)
                return NotFound();
            return NoContent();
        }
    }
}
