using System;
using GestionTicketsAPI.Entities;

namespace GestionTicketsAPI.Interfaces;

public interface IUserRepository
{
    Task<IEnumerable<User>> GetUsersAsync();
    Task<User?> GetUserByUsernameAsync(string firstname, string lastname);
    
}
