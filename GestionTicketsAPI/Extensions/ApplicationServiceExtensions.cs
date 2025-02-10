using System;
using GestionTicketsAPI.Controllers;
using GestionTicketsAPI.Data;
using GestionTicketsAPI.Entities;
using GestionTicketsAPI.Helpers;
using GestionTicketsAPI.Interfaces;
using GestionTicketsAPI.Repositories;
using GestionTicketsAPI.Services;
using Microsoft.AspNetCore.Http.Features;
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
      services.AddScoped<IPhotoService, PhotoService>();
      services.AddScoped<IUserRepository, UserRepository>();
      services.AddScoped<IUserService, UserService>();
      services.AddScoped<IAccountRepository, AccountRepository>();
      services.AddScoped<IAccountService, AccountService>();
      services.AddScoped<IPaysRepository, PaysRepository>();
      services.AddScoped<IPaysService, PaysService>();
      services.AddScoped<IProjetRepository, ProjetRepository>();
      services.AddScoped<IProjetService, ProjetService>();
      services.AddScoped<ISocieteRepository, SocieteRepository>();
      services.AddScoped<ISocieteService, SocieteService>();

      services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());
      services.Configure<CloudinarySettings>(config.GetSection("CloudinarySettings"));
      services.Configure<FormOptions>(options =>
      {
          options.MultipartBodyLengthLimit = 10 * 1024 * 1024; // 10 Mo
      });

      return services;
    }
}
