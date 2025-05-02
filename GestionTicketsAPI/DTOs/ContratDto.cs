using System;

namespace GestionTicketsAPI.DTOs;

public class ContratDto
    {
        public int Id { get; set; }
        public DateTime DateDebut { get; set; }
        public DateTime? DateFin { get; set; }
        public string TypeContrat { get; set; } = "Client-Societe";
        
        // Ces champs seront renseignés en fonction du type de contrat
        public int? SocietePartenaireId { get; set; }
        public int? ClientId { get; set; }
    }