using System;

namespace GestionTicketsAPI.DTOs;

public class SocieteDto
{
    public int Id { get; set; }
    public required string Nom { get; set; }
    public required string Adresse { get; set; }
    public required string Telephone { get; set; }
}
