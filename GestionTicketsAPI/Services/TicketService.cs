using AutoMapper;
using GestionTicketsAPI.DTOs;
using GestionTicketsAPI.Entities;
using GestionTicketsAPI.Helpers;
using GestionTicketsAPI.Interfaces;

namespace GestionTicketsAPI.Services
{
  public class TicketService : ITicketService
  {
    private readonly ITicketRepository _ticketRepository;
    private readonly IMapper _mapper;

    public TicketService(ITicketRepository ticketRepository, IMapper mapper)
    {
      _ticketRepository = ticketRepository;
      _mapper = mapper;
    }

    public async Task<TicketDto?> GetTicketByIdAsync(int id)
    {
      var ticket = await _ticketRepository.GetTicketByIdAsync(id);
      if (ticket == null)
        return null;
      return _mapper.Map<TicketDto>(ticket);
    }

    public async Task<Ticket?> GetTicketEntityByIdAsync(int id)
    {
      return await _ticketRepository.GetTicketByIdAsync(id);
    }

    public async Task<IEnumerable<TicketDto>> GetTicketsAsync()
    {
      var tickets = await _ticketRepository.GetTicketsAsync();
      return _mapper.Map<IEnumerable<TicketDto>>(tickets);
    }

    public async Task<PagedList<TicketDto>> GetTicketsPagedAsync(TicketFilterParams filterParams)
    {
      var pagedTickets = await _ticketRepository.GetTicketsPagedAsync(filterParams);
      var ticketDtos = _mapper.Map<List<TicketDto>>(pagedTickets.ToList());
      return new PagedList<TicketDto>(
          ticketDtos,
          pagedTickets.TotalCount,
          pagedTickets.CurrentPage,
          pagedTickets.PageSize
      );
    }

    public async Task AddTicketAsync(Ticket ticket)
    {
      await _ticketRepository.AddTicketAsync(ticket);
      await _ticketRepository.SaveAllAsync();
    }

    public async Task<bool> UpdateTicketAsync(Ticket ticket)
    {
      _ticketRepository.UpdateTicket(ticket);
      return await _ticketRepository.SaveAllAsync();
    }

    public async Task<bool> DeleteTicketAsync(Ticket ticket)
    {
      _ticketRepository.DeleteTicket(ticket);
      return await _ticketRepository.SaveAllAsync();
    }

    public async Task<bool> DeleteMultipleTicketsAsync(IEnumerable<int> ticketIds)
    {
      return await _ticketRepository.DeleteMultipleTicketsAsync(ticketIds);
    }

    public async Task<bool> TicketExists(string title)
    {
      return await _ticketRepository.TicketExists(title);
    }
    public async Task<bool> SaveAllAsync()
    {
      return await _ticketRepository.SaveAllAsync();
    }

    public async Task<StatutDesTicket?> GetStatusByNameAsync(string statusName)
    {
      return await _ticketRepository.GetStatusByNameAsync(statusName);
    }

    public List<object> GetTicketCountByStatus(int userId, string role)
    {
      return _ticketRepository.GetTicketCountByStatus(userId, role);
    }

    public async Task<IEnumerable<Ticket>> GetTicketsAsync(TicketFilterParams filterParams)
    {
      return await _ticketRepository.GetTicketsFilteredAsync(filterParams);
    }

    public async Task<IEnumerable<Ticket>> GetTicketsFilteredAsync(TicketFilterParams filterParams)
    {
      return await _ticketRepository.GetTicketsFilteredAsync(filterParams);
    }
  }
}
