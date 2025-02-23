using System.ComponentModel.DataAnnotations;

namespace GestionTicketsAPI.DTOs
{
    public class SocieteDto
    {
        public int Id { get; set; }
        
        [Required]
        public string Nom { get; set; } = string.Empty;
        
        [Required]
        public string Adresse { get; set; } = string.Empty;
        
        [Required]
        public string Telephone { get; set; } = string.Empty;
        
        public int PaysId { get; set; }
        public ContractRegistrationDto? Contract { get; set; }
    }
}
