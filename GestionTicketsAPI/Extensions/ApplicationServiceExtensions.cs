using System;
using GestionTicketsAPI.Data;
using GestionTicketsAPI.Interfaces;
using GestionTicketsAPI.Services;
using Microsoft.EntityFrameworkCore;

namespace GestionTicketsAPI.Extensions;

public static class ApplicationServiceExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration config)
    {
      services.AddControllers();
      // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
      services.AddEndpointsApiExplorer();
      services.AddSwaggerGen();
      services.AddDbContext<DataContext>(opt =>
      {
        opt.UseMySql(config.GetConnectionString("DefaultConnection"),
        new MySqlServerVersion(new Version(8, 2, 0)));
      });
      services.AddCors();
      services.AddScoped<ITokenService, TokenService>();

      return services;
    }
}
