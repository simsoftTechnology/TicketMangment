using System.Text.Json;
using System.Text.Json.Serialization;
using GestionTicketsAPI.Extensions;
using GestionTicketsAPI.hubs;
using GestionTicketsAPI.Middleware;
using GestionTicketsAPI.Services;
using Hangfire;
using Hangfire.MySql;
using OfficeOpenXml;


var builder = WebApplication.CreateBuilder(args);



// Add services to the container.
builder.Services.AddHangfire(configuration =>
{
    configuration.UseStorage(
        new MySqlStorage(builder.Configuration.GetConnectionString("DefaultConnection"), new MySqlStorageOptions
        {
            TablesPrefix = "Hangfire" // Préfixe pour les tables de Hangfire
        })
    );
});
builder.Services.AddHangfireServer();
builder.Services.AddApplicationServices(builder.Configuration);
builder.Services.AddIdentityServices(builder.Configuration);
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    });
// Configuration WebPush (générer vos VAPID keys)
builder.Services.AddPushServiceClient(options =>
{
    options.PublicKey  = builder.Configuration["WebPush:PublicKey"];
    options.PrivateKey = builder.Configuration["WebPush:PrivateKey"];
    options.Subject    = $"mailto:{builder.Configuration["WebPush:SubjectEmail"]}";
});

// SignalR + NotificationService
builder.Services.AddSignalR();
builder.Services.AddScoped<NotificationService>();

var app = builder.Build();



app.UseCors(x => x.AllowAnyHeader().AllowAnyMethod().WithOrigins("http://localhost:4200", "https://localhost:4200", "http://localhost:8085")
    .AllowCredentials()
    .WithExposedHeaders("Pagination"));

app.MapHub<NotificationHub>("/hubs/notifications");

app.MapGet("/", () => "Bienvenue dans l'API GestionTicketsAPI !");

// Configure the HTTP request pipeline.
app.UseMiddleware<ExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();


app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
