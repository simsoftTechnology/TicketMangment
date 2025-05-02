using System;

namespace GestionTicketsAPI.DTOs;

public class ProjetUpdateDto
    {
        public int Id { get; set; }
        public required string Nom { get; set; }
        public string? Description { get; set; }
        
        // Association à la société
        public int? SocieteId { get; set; }

        // Pour gérer le pays, si nécessaire (peut être ignoré dans le mapping)
        public int? IdPays { get; set; }

        // Pour désigner le chef de projet, on se contente de l'ID
        public int? ChefProjetId { get; set; }
    }

