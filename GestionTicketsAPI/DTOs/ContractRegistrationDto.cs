using System;
using System.ComponentModel.DataAnnotations;

namespace GestionTicketsAPI.DTOs;
public class ContractRegistrationDto
{
    [Required]
    public DateTime DateDebut { get; set; }
    
    public DateTime? DateFin { get; set; }
    
    [Required]
    [StringLength(50)]
    public string TypeContrat { get; set; } = "Client-Societe";
    
    // Obligatoire pour tous les contrats
    [Required]
    public int SocieteInitiatriceId { get; set; }
    
    // Obligatoire uniquement pour Societe-Societe
    public int? SocietePartenaireId { get; set; }
    
    // Obligatoire uniquement pour Client-Societe
    public int? ClientId { get; set; }
}
