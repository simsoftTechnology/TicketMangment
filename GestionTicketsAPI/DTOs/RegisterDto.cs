using System;
using System.ComponentModel.DataAnnotations;

namespace GestionTicketsAPI.DTOs
{
    public class RegisterDto
    {
        [Required]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        public string Role { get; set; } = string.Empty;
        
        [Required]
        public string Firstname { get; set; } = string.Empty;
        
        [Required]
        public string Lastname { get; set; } = string.Empty;
        
        [Required]
        public string Numtelephone { get; set; } = string.Empty;
        
        [Required]
        public int Pays { get; set; }
        
        public bool Actif { get; set; } = true;
        
        [Required]
        [StringLength(16, MinimumLength = 8)]
        public string Password { get; set; } = string.Empty;
        
        // L'utilisateur peut appartenir à une société (optionnel)
        public int? SocieteId { get; set; }
        
        // Informations du contrat (optionnel)
        public ContractRegistrationDto? Contract { get; set; }
    }
}
