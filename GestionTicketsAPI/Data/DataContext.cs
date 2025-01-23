using System;
using GestionTicketsAPI.Entities;
using Microsoft.EntityFrameworkCore;

namespace GestionTicketsAPI.Data;

public class DataContext(DbContextOptions options) : DbContext(options)
{
    public DbSet<Pays> Pays { get; set; }
    public DbSet<User> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
{

    modelBuilder.Entity<User>()
        .HasOne(u => u.PaysNavigation)
        .WithMany()
        .HasForeignKey(u => u.Pays)
        .OnDelete(DeleteBehavior.Restrict);

    base.OnModelCreating(modelBuilder);
}



}

