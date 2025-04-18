namespace GestionTicketsAPI.Helpers
{
    public class UserParams
    {
        private const int MaxPageSize = 50;
        public int PageNumber { get; set; } = 1;
        
        private int pageSize = 10;
        public int PageSize 
        { 
            get => pageSize;
            set => pageSize = (value > MaxPageSize) ? MaxPageSize : value;
        }
        
        // Terme de recherche
        public string? SearchTerm { get; set; }

        // Autres filtres côté serveur
        public int UserId { get; set; }
        public string? Role { get; set; }
        public string? FilterType { get; set; }
        public bool? Actif { get; set; }
        public bool? HasContract { get; set; }
        public int? SocieteId { get; set; } 
        public string? Pays { get; set; }
    }
}
