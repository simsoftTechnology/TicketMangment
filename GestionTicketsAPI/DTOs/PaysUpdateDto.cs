using System;
using System.ComponentModel.DataAnnotations;

namespace GestionTicketsAPI.DTOs;

public class PaysUpdateDto
{
  [StringLength(100, ErrorMessage = "Le nom du pays ne peut pas dépasser 100 caractères.")]
  public string? Nom { get; set; } = string.Empty;

  public string? PhotoUrl { get; set; }
  public string? CodeTel { get; set; }
}
