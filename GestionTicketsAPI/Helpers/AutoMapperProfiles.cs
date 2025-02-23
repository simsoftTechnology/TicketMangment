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
    CreateMap<Projet, ProjetDto>()
            .ForMember(dest => dest.NomPays,
                       opt => opt.MapFrom(src => src.Pays != null ? src.Pays.Nom : null))
            .ForMember(dest => dest.NomSociete,
                       opt => opt.MapFrom(src => src.Societe != null ? src.Societe.Nom : null));
    CreateMap<ProjetDto, Projet>();
    CreateMap<Societe, SocieteDto>();
    CreateMap<SocieteDto, Societe>()
        .ForMember(dest => dest.Id, opt => opt.Ignore());
    CreateMap<Societe, SocieteDetailsDto>()
        .ForMember(dest => dest.Utilisateurs, opt => opt.MapFrom(src => src.Utilisateurs))
        .ForMember(dest => dest.Projets, opt => opt.MapFrom(src => src.Projets))
        .ForMember(dest => dest.Contrat, opt => opt.MapFrom(src => src.ContratsPartenaire.FirstOrDefault()));

    CreateMap<Contrat, ContratDto>().ReverseMap();
  }
}
