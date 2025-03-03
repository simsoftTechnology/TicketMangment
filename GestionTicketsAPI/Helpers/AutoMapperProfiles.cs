using AutoMapper;
using GestionTicketsAPI.DTOs;
using GestionTicketsAPI.Entities;
using System.Linq;

namespace GestionTicketsAPI.Helpers
{
    public class AutoMapperProfiles : Profile
    {
        public AutoMapperProfiles()
        {
            CreateMap<User, UserDto>()
                .ForMember(dest => dest.Contrat, opt => opt.MapFrom(src => src.Contrats != null && src.Contrats.Any() 
                                                                              ? src.Contrats.First() 
                                                                              : null));
            CreateMap<UserUpdateDto, User>();
            CreateMap<Photo, PhotoDto>();
            CreateMap<Pays, PaysDto>()
                .ForMember(dest => dest.PhotoUrl, opt => opt.MapFrom(src => src.paysPhoto != null ? src.paysPhoto.Url : null));
            CreateMap<PaysUpdateDto, Pays>();
            CreateMap<Projet, ProjetDto>()
                .ForMember(dest => dest.NomPays, opt => opt.MapFrom(src => src.Pays.Nom))
                .ForMember(dest => dest.NomSociete, opt => opt.MapFrom(src => src.Societe.Nom));

            CreateMap<ProjetDto, Projet>();
            CreateMap<Societe, SocieteDto>();
            CreateMap<SocieteDto, Societe>()
                .ForMember(dest => dest.Id, opt => opt.Ignore());
            CreateMap<Societe, SocieteDetailsDto>()
                .ForMember(dest => dest.Utilisateurs, opt => opt.MapFrom(src => src.Utilisateurs))
                .ForMember(dest => dest.Projets, opt => opt.MapFrom(src => src.Projets))
                .ForMember(dest => dest.Contrat, opt => opt.MapFrom(src => src.ContratsPartenaire.FirstOrDefault()));

            CreateMap<Contrat, ContratDto>().ReverseMap();

            CreateMap<Ticket, TicketDto>()
                .ForMember(dest => dest.Projet, opt => opt.MapFrom(src => src.Projet))
                .ForMember(dest => dest.Utilisateur, opt => opt.MapFrom(src => src.Utilisateur))
                .ForMember(dest => dest.Developpeur, opt => opt.MapFrom(src => src.Developpeur))
                .ForMember(dest => dest.CategorieProbleme, opt => opt.MapFrom(src => src.CategorieProbleme))
                .ReverseMap()
                    .ForMember(dest => dest.Utilisateur, opt => opt.Ignore())
                    .ForMember(dest => dest.Developpeur, opt => opt.Ignore())
                    .ForMember(dest => dest.CategorieProbleme, opt => opt.Ignore())
                    .ForMember(dest => dest.Projet, opt => opt.Ignore());

            CreateMap<TicketCreateDto, Ticket>();
        }
    }
}
