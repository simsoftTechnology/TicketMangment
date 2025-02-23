using System;
using GestionTicketsAPI.Entities;
using Microsoft.EntityFrameworkCore;

namespace GestionTicketsAPI.Data
{
  public class DataContext : DbContext
  {
    public DataContext(DbContextOptions options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Pays> Pays { get; set; }
    public DbSet<Ticket> Tickets { get; set; }
    public DbSet<Societe> Societes { get; set; }
    public DbSet<Commentaire> Commentaires { get; set; }
    public DbSet<Projet> Projets { get; set; }
    public DbSet<Contrat> Contrats { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<Photo> Photos { get; set; }
    public DbSet<ProjetUser> ProjetUser { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
      base.OnModelCreating(modelBuilder);

      // ----- Configuration de la table de jointure ProjetUser -----
      modelBuilder.Entity<ProjetUser>()
          .HasKey(pu => new { pu.ProjetId, pu.UserId });

      modelBuilder.Entity<ProjetUser>()
          .HasOne(pu => pu.Projet)
          .WithMany(p => p.ProjetUsers)
          .HasForeignKey(pu => pu.ProjetId)
          .OnDelete(DeleteBehavior.Cascade);

      modelBuilder.Entity<ProjetUser>()
          .HasOne(pu => pu.User)
          .WithMany(u => u.ProjetUsers)
          .HasForeignKey(pu => pu.UserId)
          .OnDelete(DeleteBehavior.Cascade);

      // ----- Relation Pays <-> Photo -----
      modelBuilder.Entity<Photo>()
          .HasOne(p => p.Pays)
          .WithOne(p => p.paysPhoto)
          .HasForeignKey<Photo>(p => p.PaysId);

      // ----- Relation Projet <-> Societe -----
      modelBuilder.Entity<Projet>()
          .HasOne(p => p.Societe)
          .WithMany(s => s.Projets)
          .HasForeignKey(p => p.SocieteId)
          .OnDelete(DeleteBehavior.Cascade);

      // ----- Relation Projet <-> Pays -----
      modelBuilder.Entity<Projet>()
          .HasOne(p => p.Pays)
          .WithMany()
          .HasForeignKey(p => p.IdPays)
          .OnDelete(DeleteBehavior.Cascade);

      // Contrainte pour que le projet appartienne soit à une société soit à un client
      modelBuilder.Entity<Projet>()
      .ToTable(t => t.HasCheckConstraint("CK_Projet_Association",
          "((SocieteId IS NOT NULL AND ClientId IS NULL) OR (SocieteId IS NULL AND ClientId IS NOT NULL))"));

      // ----- Nouvelle configuration pour cascade : Societe <-> Pays -----
      // Attention : cela suppose que votre entité Societe possède une propriété PaysId
      // et que votre entité Pays expose une collection de Societes (par exemple, ICollection<Societe> Societes)
      modelBuilder.Entity<Societe>()
          .HasOne(s => s.Pays)
          .WithMany(p => p.Societes)
          .HasForeignKey(s => s.PaysId)
          .OnDelete(DeleteBehavior.Cascade);

      // ----- Nouvelle configuration pour cascade : Utilisateur <-> Societe -----
      // Cela suppose que l'entité User possède une propriété SocieteId
      // et que l'entité Societe possède une collection d'Utilisateurs (par exemple, ICollection<User> Utilisateurs)
      modelBuilder.Entity<User>()
          .HasOne(u => u.Societe)
          .WithMany(s => s.Utilisateurs)
          .HasForeignKey(u => u.SocieteId)
          .OnDelete(DeleteBehavior.Cascade);

      // ----- Configuration existante sur la relation User <-> Pays (si nécessaire) -----
      // Dans cet exemple, la suppression d'un Pays ne supprimera pas directement l'Utilisateur
      // (DeleteBehavior.Restrict), car l'Utilisateur peut être lié à d'autres entités ou avoir sa propre gestion.
      modelBuilder.Entity<User>()
          .HasOne(u => u.PaysNavigation)
          .WithMany()
          .HasForeignKey(u => u.Pays)
          .OnDelete(DeleteBehavior.Restrict);

      // Relation Contrat -> Client (User)
      modelBuilder.Entity<Contrat>()
          .HasOne(c => c.Client)
          .WithMany(u => u.Contrats)
          .HasForeignKey(c => c.ClientId)
          .OnDelete(DeleteBehavior.Cascade);

      // Relation Contrat -> SocietePartenaire
      modelBuilder.Entity<Contrat>()
          .HasOne(c => c.SocietePartenaire)
          .WithMany(s => s.ContratsPartenaire)
          .HasForeignKey(c => c.SocietePartenaireId)
          .OnDelete(DeleteBehavior.Cascade);

    }
  }
}
