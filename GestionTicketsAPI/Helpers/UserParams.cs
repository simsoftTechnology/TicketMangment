using System;

namespace GestionTicketsAPI.Helpers
{
    public class UserParams
    {
        private const int MaxPageSize = 50;
        public int PageNumber { get; set; } = 1;
        
        private int pageSize = 10;
        // Terme de recherche
        public string? SearchTerm { get; set; }
        // Propriétés ajoutées pour le filtrage côté serveur
        public int? UserId { get; set; }
        public string? Role { get; set; }
        public string? FilterType { get; set; }
        public int? SocieteId { get; set; } 
        public int PageSize 
        { 
            get => pageSize;
            set => pageSize = (value > MaxPageSize) ? MaxPageSize : value;
        }
        
    }
}
