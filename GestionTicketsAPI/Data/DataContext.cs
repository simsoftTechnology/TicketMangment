using System;
using GestionTicketsAPI.Entities;
using Microsoft.EntityFrameworkCore;

namespace GestionTicketsAPI.Data;

public class DataContext(DbContextOptions options) : DbContext(options)
{
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


    // Configuration de la clé primaire composite pour ProjetUser
    modelBuilder.Entity<ProjetUser>()
        .HasKey(pu => new { pu.ProjetId, pu.UserId });

    // Relation entre ProjetUser et Projet
    modelBuilder.Entity<ProjetUser>()
        .HasOne(pu => pu.Projet)
        .WithMany(p => p.ProjetUsers)
        .HasForeignKey(pu => pu.ProjetId)
        .OnDelete(DeleteBehavior.Cascade); // Suppression en cascade sur Projet

    // Relation entre ProjetUser et User
    modelBuilder.Entity<ProjetUser>()
        .HasOne(pu => pu.User)
        .WithMany(u => u.ProjetUsers)
        .HasForeignKey(pu => pu.UserId)
        .OnDelete(DeleteBehavior.Cascade);


    modelBuilder.Entity<User>()
        .HasOne(u => u.PaysNavigation)
        .WithMany()
        .HasForeignKey(u => u.Pays)
        .OnDelete(DeleteBehavior.Restrict);

    modelBuilder.Entity<Photo>()
        .HasOne(p => p.Pays)
        .WithOne(p => p.paysPhoto)
        .HasForeignKey<Photo>(p => p.PaysId);


    modelBuilder.Entity<Projet>()
            .HasOne(p => p.Societe)
            .WithMany(s => s.Projets)
            .HasForeignKey(p => p.SocieteId)
            .OnDelete(DeleteBehavior.Cascade);

    modelBuilder.Entity<Projet>()
        .HasOne(p => p.Pays)
        .WithMany()
        .HasForeignKey(p => p.IdPays)
        .OnDelete(DeleteBehavior.Cascade);

    
  }



}

