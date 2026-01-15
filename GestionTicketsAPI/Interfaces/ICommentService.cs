using System;
using GestionTicketsAPI.DTOs;
using GestionTicketsAPI.Entities;

namespace GestionTicketsAPI.Interfaces;

public interface ICommentService
{
    Task<CommentDto> CreateCommentAsync(CommentCreateDto commentCreateDto, int userId);
    Task<CommentDto> GetCommentByIdAsync(int id);
  Task<IEnumerable<CommentDto>> GetCommentsByTicketAsync(int ticketId);
}
