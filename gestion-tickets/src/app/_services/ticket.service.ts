import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Ticket } from '../_models/ticket';
import { PaginatedResult } from '../_models/pagination';
import { TicketUpdateDto } from '../_models/ticketUpdateDto';
import { TicketValidationDto } from '../_models/ticket-validation.dto';
import { FinishTicketDto } from '../_models/finish-ticket-dto';
import { AccountService } from './account.service';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private baseUrl = 'https://localhost:5001/api/tickets';

  constructor(
    private http: HttpClient,
    private accountService: AccountService
  ) { }

  getPaginatedTickets(pageNumber: number, pageSize: number, filters: any): Observable<PaginatedResult<Ticket[]>> {
    let params = new HttpParams()
      .set('PageNumber', pageNumber.toString())
      .set('PageSize', pageSize.toString());
    
      if (filters.filterType) {
        params = params.append('FilterType', filters.filterType);
      }
      
    if (filters) {
      // Ajoutez les nouveaux filtres
      if (filters.client) {
        params = params.append('Client', filters.client);
      }
      if (filters.categorie) {
        params = params.append('Categorie', filters.categorie);
      }
      if (filters.priorite) {
        params = params.append('Priorite', filters.priorite);
      }
      if (filters.statut) {
        params = params.append('Statut', filters.statut);
      }
      if (filters.qualification) {
        params = params.append('Qualification', filters.qualification);
      }
      if (filters.projet) {
        params = params.append('Projet', filters.projet);
      }
      if (filters.societe) {
        params = params.append('Societe', filters.societe);
      }
      // Transmettre le terme de recherche global si présent
      if (filters.searchTerm) {
        params = params.append('SearchTerm', filters.searchTerm);
      }
    }
    
    return this.http.get<Ticket[]>(this.baseUrl, { observe: 'response', params })
      .pipe(
        map(response => {
          const paginatedResult: PaginatedResult<Ticket[]> = {
            items: response.body || [],
            pagination: undefined
          };
          const paginationHeader = response.headers.get('Pagination');
          if (paginationHeader) {
            paginatedResult.pagination = JSON.parse(paginationHeader);
          }
          return paginatedResult;
        })
      );
  }  

  getTicket(id: number): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.baseUrl}/${id}`);
  }

  createTicket(formData: FormData): Observable<Ticket> {
    return this.http.post<Ticket>(this.baseUrl, formData);
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

  // Pour la mise à jour avec attachment
  uploadAttachment(formData: FormData): Observable<{ secureUrl: string }> {
    return this.http.post<{ secureUrl: string }>(`${this.baseUrl}/upload`, formData);
  }

  validateTicket(id: number, validationData: TicketValidationDto): Observable<any> {
    return this.http.post(`${this.baseUrl}/validate/${id}`, validationData);
  }

  finishTicket(ticketId: number, finishData: FinishTicketDto): Observable<any> {
    return this.http.post(`${this.baseUrl}/finish/${ticketId}`, finishData);
  }

  updateResponsible(ticketId: number, responsibleDto: { responsibleId: number }): Observable<any> {
    return this.http.post(`${this.baseUrl}/updateResponsible/${ticketId}`, responsibleDto);
  }
  getTicketCountByStatus() {
    return this.http.get<any[]>(`${this.baseUrl}/status-count`);
  }

  exportTickets(filters: any): Observable<Blob> {
    let params = new HttpParams();
    if (filters) {
      if (filters.client) {
        params = params.append('Client', filters.client);
      }
      if (filters.categorie) {
        params = params.append('Categorie', filters.categorie);
      }
      if (filters.priorite) {
        params = params.append('Priorite', filters.priorite);
      }
      if (filters.statut) {
        params = params.append('Statut', filters.statut);
      }
      if (filters.qualification) {
        params = params.append('Qualification', filters.qualification);
      }
      if (filters.projet) {
        params = params.append('Projet', filters.projet);
      }
      if (filters.societe) {
        params = params.append('Societe', filters.societe);
      }
      if (filters.searchTerm) {
        params = params.append('SearchTerm', filters.searchTerm);
      }
    }
    return this.http.get(`${this.baseUrl}/export`, { params, responseType: 'blob' });
  }
  
}
