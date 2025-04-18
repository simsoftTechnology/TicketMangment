using System.Security.Claims;
using AutoMapper;
using CloudinaryDotNet.Actions;
using GestionTicketsAPI.DTOs;
using GestionTicketsAPI.Entities;
using GestionTicketsAPI.Helpers;
using GestionTicketsAPI.Interfaces;
using GestionTicketsAPI.Services;
using Hangfire;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using ClosedXML.Excel;

namespace GestionTicketsAPI.Controllers
{
  [ApiController]
  public class TicketsController : BaseApiController
  {
    private readonly ITicketService _ticketService;
    private readonly IMapper _mapper;
    private readonly IPhotoService _photoService;
    private readonly EmailService _emailService;
    private readonly IUserService _userService;
    private readonly ICommentService _commentService;
    private readonly ExcelExportServiceClosedXML _excelExportService;
    private readonly IWebHostEnvironment _env;

    public TicketsController(IWebHostEnvironment env, ExcelExportServiceClosedXML excelExportService, ITicketService ticketService, IMapper mapper, IPhotoService photoService, IUserService userService, EmailService emailService, ICommentService commentService)
    {
      _ticketService = ticketService;
      _mapper = mapper;
      _photoService = photoService;
      _userService = userService;
      _emailService = emailService;
      _commentService = commentService;
      _excelExportService = excelExportService;
      _env = env;
    }

    // GET api/tickets?...
    [HttpPost("paged")]
    public async Task<ActionResult<IEnumerable<TicketDto>>> GetTickets([FromBody] TicketFilterParams filterParams)
    {
      var userIdClaim = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier);
      var roleClaim = HttpContext.User.FindFirst(ClaimTypes.Role);
      if (userIdClaim != null && roleClaim != null)
      {
        filterParams.UserId = int.Parse(userIdClaim.Value);
        filterParams.Role = roleClaim.Value;
      }

      var pagedTickets = await _ticketService.GetTicketsPagedAsync(filterParams);

      var pagination = new
      {
        currentPage = pagedTickets.CurrentPage,
        pageSize = pagedTickets.PageSize,
        totalItems = pagedTickets.TotalCount,
        totalPages = pagedTickets.TotalPages
      };
      Response.Headers["Pagination"] = JsonConvert.SerializeObject(pagination);
      return Ok(pagedTickets);
    }

    // GET api/tickets/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<TicketDto>> GetTicket(int id)
    {
      var ticketDto = await _ticketService.GetTicketByIdAsync(id);
      if (ticketDto == null) return NotFound();
      return Ok(ticketDto);
    }

    // POST api/tickets
    [HttpPost]
    public async Task<ActionResult<TicketDto>> CreateTicket([FromBody] TicketCreateDto ticketCreateDto)
    {
      if (await _ticketService.TicketExists(ticketCreateDto.Title))
        return BadRequest("Un ticket avec ce titre existe déjà");

      // Variable pour stocker l'URL de l'attachement enregistré localement
      string attachmentUrl = null;

      if (!string.IsNullOrEmpty(ticketCreateDto.AttachmentBase64) && !string.IsNullOrEmpty(ticketCreateDto.AttachmentFileName))
      {
        byte[] fileBytes = Convert.FromBase64String(ticketCreateDto.AttachmentBase64);
        string assetsPath = Path.Combine(_env.WebRootPath, "assets");
        if (!Directory.Exists(assetsPath))
        {
          Directory.CreateDirectory(assetsPath);
        }
        string fileName = $"{Guid.NewGuid()}_{ticketCreateDto.AttachmentFileName}";
        string filePath = Path.Combine(assetsPath, fileName);
        await System.IO.File.WriteAllBytesAsync(filePath, fileBytes);

        // Utilisation d'une URL absolue
        var baseUrl = $"{Request.Scheme}://{Request.Host}";
        attachmentUrl = $"{baseUrl}/assets/{fileName}";
      }


      var ticket = _mapper.Map<Ticket>(ticketCreateDto);
      ticket.CreatedAt = DateTime.UtcNow;
      ticket.UpdatedAt = null;

      var defaultStatus = await _ticketService.GetStatusByNameAsync("—");
      if (defaultStatus == null)
        return BadRequest("Statut par défaut introuvable");
      ticket.StatutId = defaultStatus.Id;

      if (!string.IsNullOrEmpty(attachmentUrl))
      {
        ticket.Attachments = attachmentUrl;
      }

      await _ticketService.AddTicketAsync(ticket);
      await _ticketService.SaveAllAsync();

      var ticketFromDb = await _ticketService.GetTicketByIdAsync(ticket.Id);
      if (ticketFromDb == null)
      {
        return NotFound();
      }

      var chefProjet = ticketFromDb.Projet?.ChefProjet;
      if (chefProjet != null)
      {
                BackgroundJob.Enqueue(() => _emailService.SendEmailAsync(
                    $"{chefProjet.FirstName} {chefProjet.LastName}",
                    chefProjet.Email,
                    "Nouveau ticket créé",
                      $@"
                        < html >
                        < body style = 'font-family: Arial, sans-serif; color: #333; font-size: 14px;' >
                        < h3 style = 'color: #2c3e50;' > Nouveau ticket de support </ h3 >


                        < p > Bonjour {chefProjet.FirstName} {chefProjet.LastName},</ p >

                        < p >                    Ceci est une notification d'ouverture de ticket de support au département Support Technique.                </ p >

                        < p >                    Une nouvelle Ticket a été créée par M./ Mme { ticket.Owner.FirstName}                { ticket.Owner.LastName}.      </ p >

                        < p >    Vous pouvez consulter ce ticket à tout moment ici :   < a href = 'https://simsoft-gt.tn/home/Tickets/details/{ticket.Id}'  style = 'color: #de0b0b;  font-weight: bold; font-family: Arial, sans-serif;' > Ticket N° { ticket.Id}     </ a >    </ p >

                        < ul >
                            < li >< strong > Sujet :</ strong > { ticket.Title}</ li >
                            < li >< strong > Projet :</ strong > { ticketFromDb.Projet.Nom}</ li >
                            < li >< strong > Statut :</ strong > Ouvert </ li >
                        </ ul >

                        < p style = 'margin-top: 20px;' >   Nous restons à votre disposition pour toute information complémentaire.  </ p >

                        < p > Cordialement, </ p >

                        < p >< strong > Support Technique </ strong > </ p >

                        < p > SIMSOFT TECHNOLOGIES </ p >


                        </ body >
                        </ html > "
        ));
      }
           



      var client = ticketFromDb.Owner;
      if (client != null)
      {
                BackgroundJob.Enqueue(() => _emailService.SendEmailAsync(
             $"{client.FirstName} {client.LastName}",
             client.Email,
             "Nouveau ticket créé",
             $@"
                <html>
                <body style='font-family: Arial, sans-serif; color: #333; font-size: 14px;'>
                <h3 style='color: #2c3e50;'> Nouveau ticket de support</h3>


                <p>Bonjour {ticket.Owner.FirstName} {ticket.Owner.LastName},</p>

                <p>
                    Ceci est une notification d'ouverture de ticket de support au département Support Technique.
                </p>

                <p>
                    Une nouvelle Ticket a été créée par M./Mme {ticket.Owner.FirstName} {ticket.Owner.LastName}.
                </p>

                <p>
                 Vous pouvez consulter ce ticket à tout moment ici : <a href='https://simsoft-gt.tn/home/Tickets/details/{ticket.Id}'  style='color: #de0b0b;  font-weight: bold; font-family: Arial, sans-serif;'>   Ticket N° {ticket.Id}     </a>    </p>


                <ul>
                    <li><strong>Sujet :</strong> {ticket.Title}</li>
                    <li><strong>Projet :</strong> {ticketFromDb.Projet.Nom}</li>
                    <li><strong>Statut :</strong> Ouvert</li>
                </ul>

                <p style='margin-top: 20px;'>      Nous restons à votre disposition pour toute information complémentaire.    </p>

                <p> Cordialement, </p>

                <p><strong>  Support Technique</strong> </p>

                <p> SIMSOFT TECHNOLOGIES </p>
    
                </body>
                </html>
             "
         ));
            }

      var superAdmins = await _userService.GetUsersByRoleAsync("super admin");
      foreach (var admin in superAdmins)
      {
        //BackgroundJob.Enqueue(() => _emailService.SendEmailAsync(
        //    $"{admin.FirstName} {admin.LastName}",
        //    admin.Email,
        //    "Nouveau ticket créé",
        //    $"Bonjour {admin.FirstName} {admin.LastName},<br><br>" +
        //    $"Le client {ticket.Owner.FirstName} {ticket.Owner.LastName} a créé un nouveau ticket <br><br>" +
        //    $"intitulé : {ticket.Title} <br><br>" +
        //    $"N° :{ticket.Id}). <br><br>" +
        //    $" Veuillez vérifier les détails dans l'application.< br >< br >" +
        //    $"Cordialement.< br >< br >" +
        //     $"SIMSOFT TECHNOLOGIES"
        //));
      }

      var resultDto = _mapper.Map<TicketDto>(ticketFromDb);
      return CreatedAtAction(nameof(GetTicket), new { id = ticket.Id }, resultDto);
    }


    [HttpPost("validate/{id}")]
    public async Task<IActionResult> ValidateTicket(int id, [FromBody] TicketValidationDto ticketValidationDto)
    {
      var ticket = await _ticketService.GetTicketEntityByIdAsync(id);
      if (ticket == null)
        return NotFound("Ticket non trouvé");

      var currentUserIdClaim = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier);
      var currentUserRoleClaim = HttpContext.User.FindFirst(ClaimTypes.Role);
      if (currentUserIdClaim == null || currentUserRoleClaim == null)
        return Unauthorized("Utilisateur non authentifié");

      var currentUserId = int.Parse(currentUserIdClaim.Value);
      var currentUserRole = currentUserRoleClaim.Value;

      bool isAuthorized = false;
      if (ticket.Projet?.ChefProjet != null && ticket.Projet.ChefProjet.Id == currentUserId)
        isAuthorized = true;
      else if (currentUserRole.ToLower() == "super admin")
        isAuthorized = true;
      if (!isAuthorized)
        return Unauthorized("Vous n'êtes pas autorisé à valider ce ticket.");

      if (ticketValidationDto.IsAccepted)
      {
        var acceptedStatus = await _ticketService.GetStatusByNameAsync("Accepté");
        if (acceptedStatus == null)
          return BadRequest("Statut 'Accepté' introuvable");

        ticket.StatutId = acceptedStatus.Id;
        ticket.ApprovedAt = DateTime.UtcNow;

        var client = ticket.Owner;
        if (client != null)
        {
          BackgroundJob.Enqueue(() => _emailService.SendEmailAsync(
              $"{client.FirstName} {client.LastName}",
              client.Email,
              "Ticket accepté",
               $@"
                <html>
                <body style='font-family: Arial, sans-serif; color: #333; font-size: 14px;'>
                <h3>Support Technique </h3>  

                <p>Bonjour {client.FirstName} {client.LastName},</p> 

                <p>                    Ceci est une notification de validation de ticket de support .                </p>

                <p>                    Votre ticket a été accepté avec succée.                </p>

                <p>                 Vous pouvez consulter ce ticket à tout moment ici :   <a href='https://simsoft-gt.tn/home/Tickets/details/{ticket.Id}'  style='color: #de0b0b;  font-weight: bold; font-family: Arial, sans-serif;'>   Ticket N° {ticket.Id}     </a>    </p>

                <ul>
                    <li><strong>Sujet :</strong> {ticket.Title}</li>
                    <li><strong>Projet :</strong> {ticket.Projet.Nom}</li>
                    <li><strong>Statut :</strong> En cours</li>
                </ul>

                <p style='margin-top: 20px;'>      Nous restons à votre disposition pour toute information complémentaire.    </p>

                <p> Cordialement, </p>

                <p><strong>  Support Technique</strong> </p>

                <p> SIMSOFT TECHNOLOGIES </p>

                </body>
                </html>
                "
             
          ));
        }

        if (ticketValidationDto.ResponsibleId.HasValue)
        {
          ticket.ResponsibleId = ticketValidationDto.ResponsibleId.Value;
          var inProgressStatus = await _ticketService.GetStatusByNameAsync("En cours");
          if (inProgressStatus == null)
            return BadRequest("Statut 'En cours' introuvable");
          ticket.StatutId = inProgressStatus.Id;

          var responsible = await _userService.GetUserByIdAsync(ticket.ResponsibleId.Value);
          if (responsible != null)
          {
            BackgroundJob.Enqueue(() => _emailService.SendEmailAsync(
                $"{responsible.FirstName} {responsible.LastName}",
                responsible.Email,
                "Nouveau ticket assigné",
                 $@"
                   <html>
                     <body style='font-family: Arial, sans-serif; color: #333; font-size: 14px;'>
                    <h3 style='color: #2c3e50;'> Nouveau ticket de support</h3>

                    <p>Bonjour  {responsible.FirstName} {responsible.LastName},</p>

                     <p>               Ceci est une notification d'assignement de ticket de support .            </p>

                    <p>                  Vous avez été désigné comme responsable du Ticket.               </p>

                     <p>                 Vous pouvez consulter ce ticket à tout moment ici :   <a href='https://simsoft-gt.tn/home/Tickets/details/{ticket.Id}'  style='color: #de0b0b;  font-weight: bold; font-family: Arial, sans-serif;'>   Ticket N° {ticket.Id}     </a>    </p>

                    <ul>
                     <li><strong>Sujet :</strong> {ticket.Title}</li>
                     <li><strong>Projet :</strong> {ticket.Projet.Nom}</li>
                     <li><strong>Statut :</strong> En cours</li>
                    </ul>

                    <p style='margin-top: 20px;'>      Nous restons à votre disposition pour toute information complémentaire.    </p>

                    <p> Cordialement, </p>

                    <p><strong>  Support Technique</strong> </p>

                    <p> SIMSOFT TECHNOLOGIES </p>

                    </body>
                    </html>
                    " 
            ));
          }
        }
      }
      else
      {
        var refusedStatus = await _ticketService.GetStatusByNameAsync("Refusé");
        if (refusedStatus == null)
          return BadRequest("Statut 'Refusé' introuvable");
        ticket.StatutId = refusedStatus.Id;
        ticket.ValidationReason = ticketValidationDto.Reason;

        var client = ticket.Owner;
        if (client != null)
        {
          BackgroundJob.Enqueue(() => _emailService.SendEmailAsync(
              $"{client.FirstName} {client.LastName}",
              client.Email,
              "Ticket refusé",
               $@"
                <html>
                <body style='font-family: Arial, sans-serif; color: #333; font-size: 14px;'>
                <h3>Support Technique </h3>  

                <p>Bonjour {client.FirstName} {client.LastName},</p>

                <p>
                    Ceci est une notification de validation de ticket de support .
                </p>

                <p>
                    Votre ticket a été  refusé.
                </p>

                <p>
                 Vous pouvez consulter ce ticket à tout moment ici :   <a href='https://simsoft-gt.tn/home/Tickets/details/{ticket.Id}'  style='color: #de0b0b;  font-weight: bold; font-family: Arial, sans-serif;'>   Ticket N° {ticket.Id}     </a>    </p>

                <ul>
                    <li><strong>Sujet :</strong> {ticket.Title}</li>
                    <li><strong>Projet :</strong> {ticket.Projet.Nom}</li>
                    <li><strong>Statut :</strong> Refusé </li>
                    <li><strong>Raison :</strong>  {ticket.ValidationReason} </li>
                </ul>

                <p style='margin-top: 20px;'> Nous restons à votre disposition pour toute information complémentaire.    </p>

                <p> Cordialement, </p>

                <p><strong>  Support Technique</strong> </p>

                <p> SIMSOFT TECHNOLOGIES </p>

                </body>
                </html>
                "



          ));
        }
      }

      ticket.UpdatedAt = DateTime.UtcNow;

      var updateResult = await _ticketService.UpdateTicketAsync(ticket);
      if (updateResult)
        return NoContent();
      return BadRequest("La validation du ticket a échoué");
    }

    // Endpoint pour l'upload du fichier en arrière-plan
    [HttpPost("upload")]
    public async Task<IActionResult> UploadFile([FromBody] IFormFile file)
    {
      var uploadResult = await _photoService.UploadFileAsync(file);
      if (uploadResult == null || uploadResult.Error != null)
        return BadRequest("L'upload a échoué.");
      return Ok(new { secureUrl = uploadResult.SecureUrl.AbsoluteUri });
    }

    // DELETE api/tickets/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTicket(int id)
    {
      var ticketDto = await _ticketService.GetTicketByIdAsync(id);
      if (ticketDto == null) return NotFound();
      var ticket = _mapper.Map<Ticket>(ticketDto);
      var result = await _ticketService.DeleteTicketAsync(ticket);
      if (result) return NoContent();
      return BadRequest("La suppression du ticket a échoué");
    }

    // DELETE api/tickets/bulk
    [HttpDelete("bulk")]
    public async Task<IActionResult> DeleteMultipleTickets([FromBody] IEnumerable<int> ticketIds)
    {
      if (ticketIds == null || !ticketIds.Any())
      {
        return BadRequest("Aucun ticket spécifié pour la suppression.");
      }
      var result = await _ticketService.DeleteMultipleTicketsAsync(ticketIds);
      if (result)
        return NoContent();
      return BadRequest("La suppression des tickets a échoué.");
    }

    [HttpPost("finish/{id}")]
    public async Task<IActionResult> FinishTicket(int id, [FromBody] TicketCompletionDto completionDto)
    {
      var ticket = await _ticketService.GetTicketEntityByIdAsync(id);
      if (ticket == null)
        return NotFound("Ticket non trouvé");

      var currentUserIdClaim = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier);
      var currentUserRoleClaim = HttpContext.User.FindFirst(ClaimTypes.Role);
      if (currentUserIdClaim == null || currentUserRoleClaim == null)
        return Unauthorized("Utilisateur non authentifié");

      var currentUserId = int.Parse(currentUserIdClaim.Value);
      var currentUserRole = currentUserRoleClaim.Value.ToLower();

      bool isAuthorized = false;
      if (ticket.Projet?.ChefProjet != null && ticket.Projet.ChefProjet.Id == currentUserId)
        isAuthorized = true;
      else if (currentUserRole == "super admin")
        isAuthorized = true;
      else if (ticket.ResponsibleId.HasValue && ticket.ResponsibleId.Value == currentUserId)
        isAuthorized = true;

      if (!isAuthorized)
        return Unauthorized("Vous n'êtes pas autorisé à terminer ce ticket.");

      var newStatusName = completionDto.IsResolved ? "Résolu" : "Non Résolu";
      var newStatus = await _ticketService.GetStatusByNameAsync(newStatusName);
      if (newStatus == null)
        return BadRequest($"Statut '{newStatusName}' introuvable");

      ticket.StatutId = newStatus.Id;
      ticket.CompletionComment = completionDto.Comment;
      ticket.HoursSpent = completionDto.HoursSpent;
      ticket.SolvedAt = completionDto.CompletionDate;

      var updateResult = await _ticketService.UpdateTicketAsync(ticket);
      if (!updateResult)
        return BadRequest("La clôture du ticket a échoué");

      string commentText = !string.IsNullOrWhiteSpace(completionDto.Comment)
                             ? $" Commentaire : {completionDto.Comment}"
                             : "";

      if (ticket.Owner != null)
      {
        BackgroundJob.Enqueue(() => _emailService.SendEmailAsync(
            $"{ticket.Owner.FirstName} {ticket.Owner.LastName}",
            ticket.Owner.Email,
            "Ticket terminé",
             $@"
        <html>
   <body style='font-family: Arial, sans-serif; color: #051678; font-size: 14px;'>
              <h3>Support Technique </h3>
                <p>Bonjour {ticket.Owner.FirstName} {ticket.Owner.LastName},</p>

                <p>              Ceci est une notification  de ticket de support .               </p>

                <p>                    Votre ticket a été  {ticket.Statut.Name}.{commentText}.                </p>
                <p>                 Vous pouvez consulter ce ticket à tout moment ici :   <a href='https://simsoft-gt.tn/home/Tickets/details/{ticket.Id}'  style='color: #de0b0b;  font-weight: bold; font-family: Arial, sans-serif;'>   Ticket N° {ticket.Id}     </a>    </p>
                <ul>
                    <li><strong>Sujet :</strong> {ticket.Title}</li>
                    <li><strong>Projet :</strong> {ticket.Projet.Nom}</li>
                   <li><strong>Statut :</strong> Terminer </li>
                    <li><strong>Date de début :</strong> {ticket.CreatedAt:dd/MM/yyyy HH:mm} </li>
                    <li><strong>Date de fin :</strong> {completionDto.CompletionDate:dd/MM/yyyy HH:mm} </li>
                    <li><strong>Nombre d'heures :</strong> {completionDto.HoursSpent} </li>
                </ul>
                <p style='margin-top: 20px;'>      Nous restons à votre disposition pour toute information complémentaire.    </p>

                <p> Cordialement, </p>
                <p><strong>  Support Technique</strong> </p>
                <p> SIMSOFT TECHNOLOGIES </p>

</body>
</html>
"
          
        ));
      }

      if (ticket.Projet?.ChefProjet != null)
      {
        BackgroundJob.Enqueue(() => _emailService.SendEmailAsync(
            $"{ticket.Projet.ChefProjet.FirstName} {ticket.Projet.ChefProjet.LastName}",
            ticket.Projet.ChefProjet.Email,
            "Ticket terminé",

             $@"
        <html>
   <body style='font-family: Arial, sans-serif; color: #333; font-size: 14px;'>
              
 <h3>Bonjour  {ticket.Projet.ChefProjet.FirstName} {ticket.Projet.ChefProjet.LastName},</h3>

                <p>              Ceci est une notification  de ticket de support .               </p>

                <p>                    la ticket de Mr/Mme  {ticket.Owner.FirstName} {ticket.Owner.LastName}  a été  {ticket.Statut.Name}.{commentText}.                </p>

                <p>                 Vous pouvez consulter ce ticket à tout moment ici :   <a href='https://simsoft-gt.tn/home/Tickets/details/{ticket.Id}'  style='color: #de0b0b;  font-weight: bold; font-family: Arial, sans-serif;'>   Ticket N° {ticket.Id}     </a>    </p>
                <ul>
                    <li><strong>Sujet :</strong> {ticket.Title}</li>
                    <li><strong>Projet :</strong> {ticket.Projet.Nom}</li>
                    <li><strong>Statut :</strong> Terminer </li>
                    <li><strong>Date de début :</strong> {ticket.CreatedAt:dd/MM/yyyy HH:mm} </li>
                    <li><strong>Date de fin :</strong> {completionDto.CompletionDate:dd/MM/yyyy HH:mm} </li>
                    <li><strong>Nombre d'heures :</strong> {completionDto.HoursSpent} </li>

                </ul>

                <p style='margin-top: 20px;'>      Nous restons à votre disposition pour toute information complémentaire.    </p>

                <p> Cordialement, </p>
                <p><strong>  Support Technique</strong> </p>
                <p> SIMSOFT TECHNOLOGIES </p>

</body>
</html>
"
    
        ));
      }

      if (ticket.Responsible != null)
      {
      //  BackgroundJob.Enqueue(() => _emailService.SendEmailAsync(
      //      $"{ticket.Responsible.FirstName} {ticket.Responsible.LastName}",
      //      ticket.Responsible.Email,
      //      "Ticket terminé",
      //      $"Bonjour {ticket.Responsible.FirstName} {ticket.Responsible.LastName},<br>" +
      //      $"Le ticket {ticket.Title} N°{ticket.Id}  qui vous a été assigné est {ticket.Statut.Name}.{commentText}" +
      //        $"Cordialement. <br>" +
      //       $"SIMSOFT TECHNOLOGIES"
      //  ));
      }

      var superAdmins = await _userService.GetUsersByRoleAsync("super admin");
      foreach (var admin in superAdmins)
      {
        //BackgroundJob.Enqueue(() => _emailService.SendEmailAsync(
        //    $"{admin.FirstName} {admin.LastName}",
        //    admin.Email,
        //    "Ticket terminé",
        //    $"Bonjour {admin.FirstName} {admin.LastName},<br><br>" +
        //    $"Le ticket :  {ticket.Title} N°{ticket.Id} est {ticket.Statut.Name}.{commentText}" +
        //    $"Cordialement. <br>" +
        //    $"SIMSOFT TECHNOLOGIES"
        //));
      }

      string resolutionStatus = completionDto.IsResolved ? "résolu" : "non résolu";
      string commentContent = $"Votre ticket est {resolutionStatus}.<br>" +
                              $"Date de début : {ticket.CreatedAt:dd/MM/yyyy HH:mm}<br>" +
                              $"Date de fin : {completionDto.CompletionDate:dd/MM/yyyy HH:mm}<br>" +
                              $"Nombre d'heures : {completionDto.HoursSpent}<br>";
      if (!completionDto.IsResolved && !string.IsNullOrEmpty(completionDto.Comment))
      {
        commentContent += $"Cause : {completionDto.Comment}";
      }

      var commentCreateDto = new CommentCreateDto
      {
        Contenu = commentContent,
        TicketId = ticket.Id
      };

      await _commentService.CreateCommentAsync(commentCreateDto, currentUserId);

      return NoContent();
    }

    [HttpPost("updateResponsible/{id}")]
    public async Task<IActionResult> UpdateResponsible(int id, [FromBody] TicketResponsibleDto responsibleDto)
    {
      var ticket = await _ticketService.GetTicketEntityByIdAsync(id);
      if (ticket == null)
        return NotFound("Erreur : Ticket non trouvé.");

      var currentUserIdClaim = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier);
      var currentUserRoleClaim = HttpContext.User.FindFirst(ClaimTypes.Role);
      if (currentUserIdClaim == null || currentUserRoleClaim == null)
        return Unauthorized("Erreur : Utilisateur non authentifié.");

      var currentUserId = int.Parse(currentUserIdClaim.Value);
      var currentUserRole = currentUserRoleClaim.Value.ToLower();
      bool isAuthorized = false;
      if (ticket.Projet?.ChefProjet != null && ticket.Projet.ChefProjet.Id == currentUserId)
        isAuthorized = true;
      else if (currentUserRole == "super admin")
        isAuthorized = true;
      else if (ticket.ResponsibleId.HasValue && ticket.ResponsibleId.Value == currentUserId)
        isAuthorized = true;

      if (!isAuthorized)
        return Unauthorized("Erreur : Vous n'êtes pas autorisé à modifier le responsable.");

      if (ticket.ResponsibleId.HasValue && ticket.ResponsibleId.Value == responsibleDto.ResponsibleId)
      {
        return BadRequest("Erreur : Le responsable n'a pas été modifié.");
      }

      ticket.ResponsibleId = responsibleDto.ResponsibleId;
      var updateResult = await _ticketService.UpdateTicketAsync(ticket);
      if (!updateResult)
        return BadRequest("Erreur : La mise à jour du responsable a échoué.");

      var responsible = await _userService.GetUserByIdAsync(ticket.ResponsibleId.Value);
      if (responsible != null)
      {
        BackgroundJob.Enqueue(() => _emailService.SendEmailAsync(
          $"{responsible.FirstName} {responsible.LastName}",
          responsible.Email,
          "Ticket mis à jour - Nouveau responsable assigné",
          $"Bonjour {responsible.FirstName} {responsible.LastName},<br><br>" +
          $"Vous avez été désigné comme responsable du Ticket intitulé {ticket.Title} N°{ticket.Id}." +
            $"Cordialement. <br>" +
             $"SIMSOFT TECHNOLOGIES"
        ));
      }

      return NoContent();
    }

    [HttpGet("status-count")]
    public IActionResult GetTicketCountByStatus()
    {
      var userIdClaim = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier);
      var roleClaim = HttpContext.User.FindFirst(ClaimTypes.Role);
      if (userIdClaim == null || roleClaim == null)
      {
        return Unauthorized("Utilisateur non authentifié.");
      }

      int userId = int.Parse(userIdClaim.Value);
      string role = roleClaim.Value;

      var result = _ticketService.GetTicketCountByStatus(userId, role);
      return Ok(result);
    }

    [HttpPost("export")]
    public async Task<IActionResult> ExportTickets([FromBody] TicketFilterParams filterParams)
    {
      var userIdClaim = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier);
      var roleClaim = HttpContext.User.FindFirst(ClaimTypes.Role);
      if (userIdClaim != null && roleClaim != null)
      {
        filterParams.UserId = int.Parse(userIdClaim.Value);
        filterParams.Role = roleClaim.Value;
      }

      var tickets = await _ticketService.GetTicketsFilteredAsync(filterParams);
      var ticketExportDtos = _mapper.Map<IEnumerable<TicketExportDto>>(tickets);
      var content = _excelExportService.ExportToExcel(ticketExportDtos, "Tickets");

      return File(content,
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          $"TicketsExport_{DateTime.Now:yyyyMMddHHmmss}.xlsx");
    }

  }
}
