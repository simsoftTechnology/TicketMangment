using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using GestionTicketsAPI.Entities;
using GestionTicketsAPI.Interfaces;
using Newtonsoft.Json;

namespace GestionTicketsAPI.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class CategorieProblemeController : ControllerBase
  {
    private readonly ICategorieProblemeService _categorieService;

    public CategorieProblemeController(ICategorieProblemeService categorieService)
    {
      _categorieService = categorieService;
    }

    // GET : api/CategorieProbleme
    [HttpGet]
    public async Task<IActionResult> GetCategories()
    {
      var categories = await _categorieService.GetCategoriesAsync();
      return Ok(categories);
    }

    // GET : api/CategorieProbleme/paged?pageNumber=1&pageSize=10&searchTerm=
    [HttpGet("paged")]
    public async Task<IActionResult> GetCategoriesPaged([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, [FromQuery] string searchTerm = "")
    {
      var pagedCategories = await _categorieService.GetCategoriesPagedAsync(searchTerm, pageNumber, pageSize);

      var pagination = new
      {
        currentPage = pagedCategories.CurrentPage,
        itemsPerPage = pagedCategories.PageSize,
        totalItems = pagedCategories.TotalCount,
        totalPages = pagedCategories.TotalPages
      };

      Response.Headers.Add("Pagination", JsonConvert.SerializeObject(pagination));
      return Ok(pagedCategories);
    }

    // GET : api/CategorieProbleme/5
    [HttpGet("{id}")]
    public async Task<IActionResult> GetCategorie(int id)
    {
      var categorie = await _categorieService.GetCategorieByIdAsync(id);
      if (categorie == null)
        return NotFound();
      return Ok(categorie);
    }

    // POST : api/CategorieProbleme
    [HttpPost]
    public async Task<IActionResult> AddCategorie([FromBody] CategorieProbleme categorie)
    {
      if (categorie == null)
        return BadRequest("La catégorie est nulle");

      // Vérifier si la catégorie existe déjà (exemple : sur la base du nom)
      if (await _categorieService.CategorieExists(categorie.Nom))
        return BadRequest("La catégorie existe déjà");

      bool result = await _categorieService.AddCategorieAsync(categorie);
      if (result)
        return Ok(categorie);
      return BadRequest("Erreur lors de l'ajout de la catégorie");
    }


    // PUT : api/CategorieProbleme/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCategorie(int id, [FromBody] CategorieProbleme categorie)
    {
      if (categorie == null || categorie.Id != id)
        return BadRequest("ID non valide");

      var existing = await _categorieService.GetCategorieByIdAsync(id);
      if (existing == null)
        return NotFound("La catégorie n'existe pas");

      existing.Nom = categorie.Nom;
      bool result = await _categorieService.UpdateCategorieAsync(existing);
      if (result)
        return Ok(existing);
      return BadRequest("Erreur lors de la mise à jour");
    }

    // DELETE : api/CategorieProbleme/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCategorie(int id)
    {
      bool result = await _categorieService.DeleteCategorieAsync(id);
      if (result)
        return Ok("Catégorie supprimée");
      return NotFound("La catégorie n'a pas été trouvée");
    }

    // DELETE : api/CategorieProbleme/deleteMultiple
    [HttpDelete("deleteMultiple")]
    public async Task<IActionResult> DeleteMultipleCategories([FromBody] List<int> ids)
    {
      if (ids == null || !ids.Any())
      {
        return BadRequest("Aucun identifiant fourni.");
      }

      bool result = await _categorieService.DeleteMultipleCategoriesAsync(ids);
      if (result)
        return Ok("Catégories supprimées avec succès.");
      return BadRequest("Erreur lors de la suppression des catégories.");
    }
  }
}
