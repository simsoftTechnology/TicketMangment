using System;

namespace GestionTicketsAPI.DTOs;

public class UserUpdateDto
    {
        public int Id { get; set; }

        // Champs requis pour la mise à jour
        public required string Email { get; set; }
        public required string Role { get; set; }
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public required string NumTelephone { get; set; }
        public required string Pays { get; set; }
        public required bool Actif { get; set; }

        // Champs optionnels
        public int? SocieteId { get; set; }
        public ContratDto? Contrat { get; set; }
    }
