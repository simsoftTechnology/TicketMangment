using System;

namespace GestionTicketsAPI.DTOs;

using System.Text.Json.Serialization;

public class ProjetUserDto
{
    [JsonPropertyName("userId")]
    public int UserId { get; set; }
    
    [JsonPropertyName("role")]
    public required string Role { get; set; }
}


