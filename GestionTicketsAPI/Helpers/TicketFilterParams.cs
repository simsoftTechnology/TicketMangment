namespace GestionTicketsAPI.Helpers
{
    public class TicketFilterParams
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? SearchTerm { get; set; }
        public string? Id { get; set; }
        public string? Titre { get; set; }
        public int? Client { get; set; }
        public int? Categorie { get; set; }
        public int? Priorite { get; set; }
        public int? Statut { get; set; }
        public int? Qualification { get; set; }
        public int? Projet { get; set; }
        public int? Societe { get; set; }
        public int UserId { get; set; }
        public string? Role { get; set; }
        public DateTime? endDate { get; set; }
        public DateTime? startDate { get; set; }

        public string? FilterType { get; set; }

    }
}

