using System.Collections.Generic;

namespace GestionTicketsAPI.DTOs
{
    public class SocieteDetailsDto
    {
        public int Id { get; set; }
        public required string Nom { get; set; }
        public required string Adresse { get; set; }
        public required string Telephone { get; set; }
        
        // Liste des utilisateurs et projets associés
        public ICollection<UserDto> Utilisateurs { get; set; } = new List<UserDto>();
        public ICollection<ProjetDto> Projets { get; set; } = new List<ProjetDto>();

        public ContratDto? Contrat { get; set; }
  }
}
