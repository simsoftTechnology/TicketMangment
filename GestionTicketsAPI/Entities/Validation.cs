using System;

namespace GestionTicketsAPI.Entities;

public class Validation
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public DateTime? DeletedAt { get; set; }
}
