using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Unicode;
using GestionTicketsAPI.Extensions;
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

var app = builder.Build();

app.MapGet("/", () => "Bienvenue dans l'API GestionTicketsAPI !");


app.UseHttpsRedirection();
app.UseStaticFiles();
// Middleware d'exception
app.UseMiddleware<ExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseRouting();


//app.UseCors("AllowSpecificOrigins");
app.UseCors("AllowFrontend");


app.UseAuthentication();
app.UseAuthorization();

app.UseEndpoints(endpoints =>
{
    endpoints.MapControllers();
});

app.MapControllers();

app.Run();
