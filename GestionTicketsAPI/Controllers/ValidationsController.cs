using GestionTicketsAPI.Entities;
using GestionTicketsAPI.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace GestionTicketsAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ValidationsController : ControllerBase
    {
        private readonly IValidationService _service;
        public ValidationsController(IValidationService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Validation>>> GetValidations()
        {
            var validations = await _service.GetAllValidationsAsync();
            return Ok(validations);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Validation>> GetValidation(int id)
        {
            var validation = await _service.GetValidationByIdAsync(id);
            if (validation == null)
                return NotFound();
            return Ok(validation);
        }

        [HttpPost]
        public async Task<ActionResult<Validation>> CreateValidation([FromBody] Validation validation)
        {
            var createdValidation = await _service.CreateValidationAsync(validation);
            return CreatedAtAction(nameof(GetValidation), new { id = createdValidation.Id }, createdValidation);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateValidation(int id, [FromBody] Validation validation)
        {
            if (id != validation.Id)
                return BadRequest();
            await _service.UpdateValidationAsync(validation);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteValidation(int id)
        {
            await _service.DeleteValidationAsync(id);
            return NoContent();
        }
    }
}
