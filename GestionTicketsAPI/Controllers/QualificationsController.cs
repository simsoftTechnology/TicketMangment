using GestionTicketsAPI.Entities;
using GestionTicketsAPI.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace GestionTicketsAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class QualificationsController : ControllerBase
    {
        private readonly IQualificationService _qualificationService;

        public QualificationsController(IQualificationService qualificationService)
        {
            _qualificationService = qualificationService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Qualification>>> GetAll()
        {
            var qualifications = await _qualificationService.GetAllAsync();
            return Ok(qualifications);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Qualification>> GetById(int id)
        {
            var qualification = await _qualificationService.GetByIdAsync(id);
            if (qualification == null)
                return NotFound();
            return Ok(qualification);
        }

        [HttpPost]
        public async Task<ActionResult<Qualification>> Create(Qualification qualification)
        {
            var created = await _qualificationService.AddAsync(qualification);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Qualification qualification)
        {
            if (id != qualification.Id)
                return BadRequest("L'ID ne correspond pas.");
            var result = await _qualificationService.UpdateAsync(id, qualification);
            if (!result)
                return NotFound();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _qualificationService.DeleteAsync(id);
            if (!result)
                return NotFound();
            return NoContent();
        }
    }
}
