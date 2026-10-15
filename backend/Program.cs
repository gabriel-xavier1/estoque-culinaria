using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using EstoqueCulinaria.Api.Data;
using EstoqueCulinaria.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

// SQLite connection
var dbPath = Path.Combine(AppContext.BaseDirectory, "culinary_stock.db");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite($"Data Source={dbPath}"));

builder.Services.AddScoped<IInventoryService, InventoryService>();

// CORS configuration for frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Automatically migrate/seed database
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    DbInitializer.Initialize(context);
}

app.UseCors("AllowAll");

// Do not force HTTPS redirect in development to allow smooth local API calls
// app.UseHttpsRedirection();

app.MapControllers();

app.Run();
