using System;
using GestionTicketsAPI.DTOs;

namespace GestionTicketsAPI.Interfaces;

 public interface IAccountService
    {
        Task<UserDto> RegisterAsync(RegisterDto registerDto);
        Task<UserDto> LoginAsync(LoginDto loginDto);
    }
