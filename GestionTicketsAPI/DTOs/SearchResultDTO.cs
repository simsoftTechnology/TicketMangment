using System;

namespace GestionTicketsAPI.DTOs;

public class SearchResultDTO
    {
        public int Id { get; set; }
        public string Type { get; set; } = string.Empty; // Ex: "Ticket", "User", etc.
        public string Title { get; set; } = string.Empty; // Exemple: titre du ticket ou nom complet de l'utilisateur
        public string Description { get; set; } = string.Empty; // Exemple: description du ticket ou email de l'utilisateur
    }
