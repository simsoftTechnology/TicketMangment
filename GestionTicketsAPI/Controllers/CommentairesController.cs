using System.Security.Claims;
using GestionTicketsAPI.DTOs;
using GestionTicketsAPI.Entities;
using GestionTicketsAPI.Interfaces;
using Humanizer;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace GestionTicketsAPI.Controllers
{
  [ApiController]
  public class CommentairesController : BaseApiController
  {
        private readonly ICommentService _commentService;
        private readonly IWebHostEnvironment _env;
        public CommentairesController(ICommentService commentService, IWebHostEnvironment env)
        {
            _commentService = commentService;
            _env = env;
        }

    [HttpPost]
    public async Task<ActionResult<CommentDto>> CreateComment([FromBody] CommentCreateDto commentCreateDto)
    {
      // Récupération de l'ID de l'utilisateur connecté via les claims
      var userIdClaim = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier);
      if (userIdClaim == null)
        return Unauthorized("Utilisateur non authentifié.");

      int userId = int.Parse(userIdClaim.Value);
            // 2) Traitement de l’attachement Base64 (s’il existe)
            if (!string.IsNullOrEmpty(commentCreateDto.AttachmentBase64) &&
                !string.IsNullOrEmpty(commentCreateDto.AttachmentFileName))
            {
                byte[] fileBytes;
                try
                {
                    fileBytes = Convert.FromBase64String(commentCreateDto.AttachmentBase64);
                }
                catch (FormatException)
                {
                    return BadRequest("Le format Base64 de l’attachement est invalide.");
                }

                // Prépare le dossier wwwroot/attachments
                var uploadsFolder = Path.Combine(_env.WebRootPath, "attachments");
                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                // Génère un nom de fichier unique
                var uniqueFileName = $"{Guid.NewGuid()}_{Path.GetFileName(commentCreateDto.AttachmentFileName)}";
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                await System.IO.File.WriteAllBytesAsync(filePath, fileBytes);

                // Construit l'URL d'accès (ex: https://monapi.com/attachments/xxx.pdf)
                var request = HttpContext.Request;
                var baseUrl = $"{request.Scheme}://{request.Host}";
                commentCreateDto.AttachmentFileName = $"{baseUrl}/attachments/{uniqueFileName}";
            }
            //return StatusCode(200, new { message = "Erreur serveur", details = commentCreateDto });
            try { 
                var createdComment = await _commentService.CreateCommentAsync(commentCreateDto, userId);
                if (createdComment == null)
                    return BadRequest("Erreur lors de la création du commentaire.");

                return CreatedAtAction(nameof(GetCommentById), new { id = createdComment.Id }, createdComment);
            }
              catch (Exception ex)
        {
                var error = ex.InnerException?.Message ?? ex.Message;
                return StatusCode(500, new { message = "Erreur serveur", details = error });
            }


           
    }




    [HttpGet("{id:int}")]
    public async Task<ActionResult<CommentDto>> GetCommentById(int id)
    {
      var comment = await _commentService.GetCommentByIdAsync(id);
      if (comment == null)
        return NotFound();
      return Ok(comment);
    }

    [HttpGet("ticket/{ticketId:int}")]
    public async Task<ActionResult<IEnumerable<CommentDto>>> GetCommentsByTicket(int ticketId)
    {
      var comments = await _commentService.GetCommentsByTicketAsync(ticketId);
      return Ok(comments);
    }

  }

}
