namespace GestionTicketsAPI.Entities
{
    public class TicketHistory

    {
        public int Id { get; set; }

        public int TicketId { get; set; }
        public Ticket Ticket { get; set; }   // navigation (optional)

        public string Description { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
