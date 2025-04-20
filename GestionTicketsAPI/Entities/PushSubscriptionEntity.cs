using System;
using System.ComponentModel.DataAnnotations;

namespace GestionTicketsAPI.Entities;

public class PushSubscriptionEntity
    {
        [Key]
        public int Id { get; set; }
        public string UserId { get; set; }           // Identifiant de l'utilisateur
        public string Endpoint { get; set; }
        public string P256DH { get; set; }
        public string Auth { get; set; }
    }
