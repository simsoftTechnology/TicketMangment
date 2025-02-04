namespace GestionTicketsAPI.DTOs
{
    public class ProjetDto
    {
        public int Id { get; set; }
        public required string Nom { get; set; }

        // Nouveau champ optionnel pour la description
        public string? Description { get; set; }

        public int SocieteId { get; set; }
        public string? NomSociete { get; set; }  // Nom de la société

        public int IdPays { get; set; }
        public string? NomPays { get; set; }  // Nom du pays
    }
}
