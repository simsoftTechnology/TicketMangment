using GestionTicketsAPI.Controllers;
using GestionTicketsAPI.Data;
using GestionTicketsAPI.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API;

public class BuggyController(DataContext context) : BaseApiController
{
    [Authorize]
    [HttpGet("auth")]
    public ActionResult<string> GetAuth()
    {
        return "text secret";
    }

    [HttpGet("not-found")]
    public ActionResult<User> GetNotFound()
    {
        var thing = context.Users.Find(-1);

        if (thing == null) return NotFound();

        return thing;
    }

    [HttpGet("server-error")]
    public ActionResult<User> GetServerError()
    {
        
        var thing = context.Users.Find(-1) ?? throw new Exception("Une erreur s'est produite");

        return thing;
    }

    [HttpGet("bad-request")]
    public ActionResult<string> GetBadRequest()
    {
        return BadRequest("Ce n'était pas une bonne requête");
    }
}