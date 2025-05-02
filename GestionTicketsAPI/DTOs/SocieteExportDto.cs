using System;

namespace GestionTicketsAPI.DTOs;

public class SocieteExportDto
{
    public string Nom { get; set; } = string.Empty;
    public string Adresse { get; set; } = string.Empty;
    public string Telephone { get; set; } = string.Empty;
    public string Pays { get; set; } = string.Empty;
}

