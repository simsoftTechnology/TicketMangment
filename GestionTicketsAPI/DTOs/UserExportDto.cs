using System;

namespace GestionTicketsAPI.DTOs;

public class UserExportDto
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Actif { get; set; } = string.Empty;
        public string Contrat { get; set; } = string.Empty;
        public DateTime? DateDebut { get; set; }
        public DateTime? DateFin { get; set; }
    }