import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http'; 
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Ticket } from '../_models/ticket';
import { PaginatedResult } from '../_models/pagination';
import { TicketUpdateDto } from '../_models/ticketUpdateDto';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private baseUrl = 'https://localhost:5001/api/tickets';

  constructor(private http: HttpClient) {}

  getPaginatedTickets(pageNumber?: number, pageSize?: number, searchTerm?: string): Observable<PaginatedResult<Ticket[]>> {
    let params = new HttpParams();
    if (pageNumber != null && pageSize != null) {
      params = params.append('pageNumber', pageNumber.toString());
      params = params.append('pageSize', pageSize.toString());
    }
    if (searchTerm && searchTerm.trim() !== '') {
      params = params.append('searchTerm', searchTerm);
    }

    return this.http.get<Ticket[]>(this.baseUrl, { observe: 'response', params })
      .pipe(
        map((response: HttpResponse<Ticket[]>) => {
          const paginatedResult: PaginatedResult<Ticket[]> = {
            items: response.body || [],
            pagination: response.headers.get('Pagination')
              ? JSON.parse(response.headers.get('Pagination')!)
              : { currentPage: 1, pageSize: 5, totalCount: 0, totalPages: 0 }
          };
          return paginatedResult;
        })
      );
  }

  getTicket(id: number): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.baseUrl}/${id}`);
  }

  createTicket(ticket: Ticket): Observable<Ticket> {
    return this.http.post<Ticket>(this.baseUrl, ticket);
  }

  updateTicket(id: number, ticket: TicketUpdateDto): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, ticket);
  }
  

  deleteTicket(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  // Méthode pour supprimer plusieurs tickets (appel vers DELETE api/tickets/bulk)
  deleteMultipleTickets(ticketIds: number[]): Observable<any> {
    return this.http.request('delete', `${this.baseUrl}/bulk`, { body: ticketIds });
  }

  // Utilise l'endpoint qui gère l'upload via Cloudinary
  createTicketWithAttachment(formData: FormData): Observable<Ticket> {
    return this.http.post<Ticket>(`${this.baseUrl}/withAttachment`, formData);
  }
  
  // Pour la mise à jour avec attachment
  uploadAttachment(formData: FormData): Observable<{ secureUrl: string }> {
    return this.http.post<{ secureUrl: string }>(`${this.baseUrl}/upload`, formData);
  }
}
