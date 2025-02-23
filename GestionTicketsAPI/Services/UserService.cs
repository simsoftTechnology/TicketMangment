using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using GestionTicketsAPI.DTOs;
using GestionTicketsAPI.Helpers;
using GestionTicketsAPI.Interfaces;

namespace GestionTicketsAPI.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;
        
        public UserService(IUserRepository userRepository, IMapper mapper)
        {
            _userRepository = userRepository;
            _mapper = mapper;
        }

        public async Task<PagedList<UserDto>> GetAllUsersAsync(UserParams userParams)
        {
            var users = await _userRepository.GetUsersAsync(userParams);
            var userDtos = _mapper.Map<IEnumerable<UserDto>>(users);
            var pagedUserDtos = new PagedList<UserDto>(
                userDtos.ToList(),
                users.TotalCount,
                users.CurrentPage,
                users.PageSize
            );
            return pagedUserDtos;
        }

        public async Task<IEnumerable<UserDto>> GetAllUsersNoPaginationAsync()
        {
            var users = await _userRepository.GetUsersNoPaginationAsync();
            return _mapper.Map<IEnumerable<UserDto>>(users);
        }

        public async Task<UserDto?> GetUserByIdAsync(int id)
        {
            var user = await _userRepository.GetUserByIdAsync(id);
            return user == null ? null : _mapper.Map<UserDto>(user);
        }

        public async Task<bool> DeleteUserAsync(int id)
        {
            var user = await _userRepository.GetUserWithProjetUsersAsync(id);
            if (user == null)
                return false;
            return await _userRepository.DeleteUserAsync(user);
        }
    }
}
