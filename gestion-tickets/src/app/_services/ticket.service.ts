import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, from, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { Ticket } from '../_models/ticket';
import { PaginatedResult, Pagination } from '../_models/pagination';
import { TicketUpdateDto } from '../_models/ticketUpdateDto';
import { TicketValidationDto } from '../_models/ticket-validation.dto';
import { FinishTicketDto } from '../_models/finish-ticket-dto';
import { environment } from '../../environment/environment';
import { AccountService } from './account.service';
import { TicketCreateDto } from '../_models/ticketCreateDto';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private   baseUrl = environment.URLAPI+'tickets';

  constructor(
    private http: HttpClient,
    private accountService: AccountService
  ) { }

  getPaginatedTickets(
    pageNumber: number,
    pageSize: number,
    filters: any
  ): Observable<PaginatedResult<Ticket[]>> {
    const params = {
      pageNumber,
      pageSize,
      ...filters
    };
  
    return this.http.post<any>(`${this.baseUrl}/paged`, params, { observe: 'response' })
      .pipe(
        map(response => {
          const paginationHeader = response.headers.get('Pagination');
          const paginatedResult: PaginatedResult<Ticket[]> = {
            items: response.body || [],
            pagination: paginationHeader ? JSON.parse(paginationHeader) : {} as Pagination
          };
          return paginatedResult;
        })
      );
  }

  getTicket(id: number): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.baseUrl}/${id}`);
  }

  // Convert file to base64 using a Promise; used internally by createTicket when needed.
  convertFileToBase64(file: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
    });
  }

  // Create ticket returns an Observable.
  createTicket(ticket: TicketCreateDto, file?: File): Observable<any> {
    // If a file is provided, convert it to base64 and then post the ticket.
    if (file) {
      return from(this.convertFileToBase64(file)).pipe(
        switchMap(base64 => {
          ticket.attachmentBase64 = base64;
          ticket.attachmentFileName = file.name;
          return this.http.post(this.baseUrl, ticket);
        }),
        catchError(error => {
          console.error("Erreur lors de la conversion du fichier", error);
          return throwError(error);
        })
      );
    } else {
      return this.http.post(this.baseUrl, ticket);
    }
  }
  
  updateTicket(id: number, ticket: TicketUpdateDto): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, ticket);
  }



  // For updating with attachment.
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

  getTicketCountByStatus(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/status-count`);
  }

  exportTickets(filters: any): Observable<Blob> {
    return this.http.post(`${this.baseUrl}/export`, filters, { responseType: 'blob' });
  }

}
