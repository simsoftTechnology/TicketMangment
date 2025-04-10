using System;
using GestionTicketsAPI.DTOs;
using GestionTicketsAPI.Entities;

namespace GestionTicketsAPI.Interfaces;

 public interface IAccountService
    {
        Task<UserDto> RegisterAsync(RegisterDto registerDto);
        Task<UserDto> LoginAsync(LoginDto loginDto);
        Task SaveResetTokenAsync(int userId, string token, DateTime expires);
        Task<User> GetUserByResetTokenAsync(string token);
    }
