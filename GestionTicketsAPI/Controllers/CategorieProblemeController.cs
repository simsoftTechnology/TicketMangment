using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using GestionTicketsAPI.Entities;
using GestionTicketsAPI.Interfaces;
using Newtonsoft.Json;
using GestionTicketsAPI.Services;
using AutoMapper;
using GestionTicketsAPI.Helpers;

namespace GestionTicketsAPI.Controllers
{
  [ApiController]
  public class CategorieProblemeController : BaseApiController
  {
    private readonly ICategorieProblemeService _categorieService;
    private readonly ExcelExportServiceClosedXML _excelExportService;
    private readonly IMapper _mapper;

    public CategorieProblemeController(ExcelExportServiceClosedXML excelExportService, IMapper mapper, ICategorieProblemeService categorieService)
    {
      _categorieService = categorieService;
      _mapper = mapper;
      _excelExportService = excelExportService;
    }

    // GET : api/CategorieProbleme
    [HttpGet]
    public async Task<IActionResult> GetCategories()
    {
      var categories = await _categorieService.GetCategoriesAsync();
      return Ok(categories);
    }

    // GET : api/CategorieProbleme/paged?pageNumber=1&pageSize=10&searchTerm=
    public class CategoriesPagedRequest
    {
      public int PageNumber { get; set; } = 1;
      public int PageSize { get; set; } = 10;
      public string SearchTerm { get; set; } = "";
    }

    [HttpPost("paged")]
    public async Task<IActionResult> GetCategoriesPaged([FromBody] CategoriesPagedRequest request)
    {
      var pagedCategories = await _categorieService.GetCategoriesPagedAsync(request.SearchTerm, request.PageNumber, request.PageSize);

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
    [HttpPatch("{id}")]
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

    [HttpGet("export")]
    public async Task<IActionResult> ExportCategories()
    {
      // Récupérer toutes les catégories directement via l'entité
      var categories = await _categorieService.GetCategoriesAsync();

      // Générer le fichier Excel en utilisant directement la collection d'entités
      var content = _excelExportService.ExportToExcel(categories, "Categories");

      return File(content,
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          $"CategoriesExport_{DateTime.Now:yyyyMMddHHmmss}.xlsx");
    }

  }
}
