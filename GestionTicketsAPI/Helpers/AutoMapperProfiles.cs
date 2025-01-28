using System;
using AutoMapper;
using GestionTicketsAPI.DTOs;
using GestionTicketsAPI.Entities;

namespace GestionTicketsAPI.Helpers;

public class AutoMapperProfiles : Profile
{
    public AutoMapperProfiles()
    {
        CreateMap<User, UserDto>();
        CreateMap<Photo, PhotoDto>();
        CreateMap<Pays, PaysDto>()
          .ForMember(dest => dest.PhotoUrl, opt => opt.MapFrom(src => src.paysPhoto != null ? src.paysPhoto.Url : null));
        CreateMap<PaysUpdateDto, Pays>();
    }       
}
