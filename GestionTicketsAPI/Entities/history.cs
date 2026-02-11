using System.ComponentModel.DataAnnotations;

namespace GestionTicketsAPI.Entities
{
    public class history
    {
        [Key]
        public int Id { get; set; }
        public int TickerId { get; set; }
        public required string Description { get; set; }
        public DateTime date { get; set; }
    }
}
