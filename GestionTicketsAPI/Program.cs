using System.Text.Json;
using System.Text.Json.Serialization;
using GestionTicketsAPI.Extensions;
using GestionTicketsAPI.hubs;
using GestionTicketsAPI.Middleware;
 
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
        options.JsonSerializerOptions.Encoder = System.Text.Encodings.Web.JavaScriptEncoder.Create(System.Text.Unicode.UnicodeRanges.All);
    });

// Configuration des CORS
//"https://mgmt.simsoft.tn:8040"

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:4200")

              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddControllers()
    .AddJsonOptions(opts =>
        opts.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    );

// WebPush, SignalR, NotificationService…
builder.Services.AddPushServiceClient(opts =>
{
    opts.PublicKey  = builder.Configuration["WebPush:PublicKey"];
    opts.PrivateKey = builder.Configuration["WebPush:PrivateKey"];
    opts.Subject    = $"mailto:{builder.Configuration["WebPush:SubjectEmail"]}";
});
builder.Services.AddSignalR();
builder.Services.AddScoped<NotificationService>();

var app = builder.Build();

app.MapGet("/", () => "Bienvenue dans l'API GestionTicketsAPI !");


app.UseHttpsRedirection();
app.UseStaticFiles();
// Middleware d'exception
// 3. Appliquez la policy CORS tout de suite, avant les middlewares
app.UseCors("AllowClient");

// 4. Pipeline d’exceptions, HTTPS, auth, etc.
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

app.UseEndpoints(endpoints =>
{
    endpoints.MapControllers();
});

// 5. Vos endpoints
app.MapHub<NotificationHub>("/hubs/notifications")
   .RequireCors("AllowClient");
app.MapControllers();
app.MapGet("/", () => "Bienvenue dans l'API GestionTicketsAPI !");

app.Run();
