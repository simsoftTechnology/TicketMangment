using System;
using System.ComponentModel.DataAnnotations;

namespace GestionTicketsAPI.Entities;

public class CategorieProbleme
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public required string Nom { get; set; }
    }
