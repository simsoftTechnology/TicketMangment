using System.ComponentModel.DataAnnotations;
using GestionTicketsAPI.Entities;

namespace GestionTicketsAPI.DTOs
{
    public class SocieteDto
    {
        public int Id { get; set; }
        
        [Required]
        public string Nom { get; set; } = string.Empty;
        
        [Required]
        public string Adresse { get; set; }
        
        [Required]
        public string Telephone { get; set; } = string.Empty;
        
        public int PaysId { get; set; }
        public PaysDto? Pays { get; set; }
        public ContractRegistrationDto? Contract { get; set; }
    }
    public class returnType
    {
       public string test { get; set; }
    }
}
