import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardCountsDto } from '../_models/dashboardCountsDto';
import { environment } from '../../environment/environment';
import { TicketFilterRequest } from '../_models/TicketFilterRequest';
import { TicketStatDto } from '../_models/ticket-stat.dto';

@Injectable({
  providedIn: 'root'
})
export class DashboardService { 
   baseUrl = environment.URLAPI+'dashboard';

  constructor(private http: HttpClient) {}

  getDashboardCounts(): Observable<DashboardCountsDto> {
    return this.http.get<DashboardCountsDto>(`${this.baseUrl}/counts`);
  }

    getDashboardCountHours( reqUser: TicketFilterRequest): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/hours`, reqUser);
  }
  getTicketsByUser(req: TicketFilterRequest): Observable<TicketStatDto[]> {
    return this.http.post<TicketStatDto[]>(`${this.baseUrl}/tickets-by-user`, req);
  }

  getTicketsByStatus(req: TicketFilterRequest): Observable<TicketStatDto[]> {
    return this.http.post<TicketStatDto[]>(`${this.baseUrl}/tickets-by-status`, req);
  }
  getTicketsFiltered(req: TicketFilterRequest): Observable<TicketStatDto[]> {
    return this.http.post<TicketStatDto[]>(`${this.baseUrl}/tickets-filtered`, req);
  }
  getMyTicketsCount(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/my-tickets-count`);
  }
  

}
