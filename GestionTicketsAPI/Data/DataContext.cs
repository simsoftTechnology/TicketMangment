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



    protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    
    modelBuilder.Entity<User>()
        .HasOne(u => u.PaysNavigation)
        .WithMany()
        .HasForeignKey(u => u.Pays)
        .OnDelete(DeleteBehavior.Restrict);

    modelBuilder.Entity<Photo>()
        .HasOne(p => p.Pays)
        .WithOne(p => p.paysPhoto)
        .HasForeignKey<Photo>(p => p.PaysId);

    base.OnModelCreating(modelBuilder);
}



}

