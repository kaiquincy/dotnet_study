using Microsoft.EntityFrameworkCore;
using PhotoOrderApi.Models;

namespace PhotoOrderApi.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> opt) : base(opt) { }

        public DbSet<User> Users => Set<User>();
        public DbSet<Image> Images => Set<Image>();
        public DbSet<Order> Orders => Set<Order>();
        public DbSet<OrderDetail> OrderDetails => Set<OrderDetail>();
        public DbSet<Payment> Payments => Set<Payment>();
        public DbSet<OrderStatus> OrderStatuses => Set<OrderStatus>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Thiết lập one-to-one Order ↔ OrderStatus
            modelBuilder.Entity<Order>()
                .HasOne(o => o.OrderStatus)
                .WithOne(s => s.Order)
                .HasForeignKey<OrderStatus>(s => s.OrderId);

            base.OnModelCreating(modelBuilder);
        }
    }
}