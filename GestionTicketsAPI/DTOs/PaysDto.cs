using System;
using System.ComponentModel.DataAnnotations;
using GestionTicketsAPI.Entities;

namespace GestionTicketsAPI.DTOs;

public class PaysDto
{
  public int IdPays { get; set;} 

  public string ?Nom { get; set; }

  public string? PhotoUrl { get; set; }
}
