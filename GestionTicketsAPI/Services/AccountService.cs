using System;
using System.Security.Cryptography;
using System.Text;
using AutoMapper;
using GestionTicketsAPI.DTOs;
using GestionTicketsAPI.Entities;
using GestionTicketsAPI.Interfaces;

namespace GestionTicketsAPI.Services;

 public class AccountService : IAccountService
    {
        private readonly IAccountRepository _accountRepository;
        private readonly ITokenService _tokenService;
        private readonly IMapper _mapper;
        
        public AccountService(IAccountRepository accountRepository, ITokenService tokenService, IMapper mapper)
        {
            _accountRepository = accountRepository;
            _tokenService = tokenService;
            _mapper = mapper;
        }
        
        public async Task<UserDto> RegisterAsync(RegisterDto registerDto)
        {
            // Vérifie si l'utilisateur existe déjà
            if (await _accountRepository.UserExistsAsync(registerDto.Firstname, registerDto.Lastname, registerDto.Email))
                throw new Exception("User already exists");
            
            // Récupère l'entité Pays correspondant à l'ID fourni dans le DTO
            var pays = await _accountRepository.GetPaysByIdAsync(registerDto.Pays);
            if (pays == null)
                throw new Exception("Le pays spécifié est introuvable.");
            
            using var hmac = new HMACSHA512();
            var user = new User
            {
                FirstName = registerDto.Firstname,
                LastName = registerDto.Lastname,
                Role = registerDto.Role,
                Email = registerDto.Email,
                NumTelephone = registerDto.Numtelephone,
                Pays = registerDto.Pays,
                PaysNavigation = pays,
                Actif = registerDto.Actif,
                PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(registerDto.Password)),
                PasswordSalt = hmac.Key
            };
            
            await _accountRepository.AddUserAsync(user);
            
            if (!await _accountRepository.SaveAllAsync())
                throw new Exception("Une erreur s'est produite lors de l'enregistrement de l'utilisateur.");
            
            // Utilisation d'AutoMapper pour transformer l'entité en DTO
            var userDto = _mapper.Map<UserDto>(user);
            // Création du token et affectation dans le DTO
            userDto.Token = _tokenService.CreateToken(user);
            
            return userDto;
        }

        public async Task<UserDto> LoginAsync(LoginDto loginDto)
        {
            var user = await _accountRepository.GetUserByEmailAsync(loginDto.Email);
            if (user == null)
                throw new Exception("L'adresse e-mail est incorrecte");
            
            using var hmac = new HMACSHA512(user.PasswordSalt);
            var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(loginDto.Password));
            
            for (int i = 0; i < computedHash.Length; i++)
            {
                if (computedHash[i] != user.PasswordHash[i])
                    throw new Exception("Le mot de passe est incorrect");
            }
            
            // Transformation de l'entité en DTO via AutoMapper
            var userDto = _mapper.Map<UserDto>(user);
            userDto.Token = _tokenService.CreateToken(user);
            
            return userDto;
        }
    }