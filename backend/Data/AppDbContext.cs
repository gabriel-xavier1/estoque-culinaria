using System;
using Microsoft.EntityFrameworkCore;
using EstoqueCulinaria.Api.Models;

namespace EstoqueCulinaria.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<FoodItem> FoodItems => Set<FoodItem>();
        public DbSet<FoodBatch> FoodBatches => Set<FoodBatch>();
        public DbSet<StockTransaction> StockTransactions => Set<StockTransaction>();
        public DbSet<AlertConfig> AlertConfigs => Set<AlertConfig>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<FoodItem>()
                .HasIndex(f => f.Code)
                .IsUnique();

            modelBuilder.Entity<FoodItem>()
                .HasMany(f => f.Batches)
                .WithOne(b => b.FoodItem)
                .HasForeignKey(b => b.FoodItemId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<FoodItem>()
                .HasMany(f => f.Transactions)
                .WithOne(t => t.FoodItem)
                .HasForeignKey(t => t.FoodItemId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<StockTransaction>()
                .HasOne(t => t.FoodBatch)
                .WithMany()
                .HasForeignKey(t => t.FoodBatchId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
