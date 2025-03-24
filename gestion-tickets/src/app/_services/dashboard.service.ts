import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { DashboardCountsDto } from '../_models/dashboardCountsDto';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private baseUrl = 'https://localhost:5001/api/dashboard';

  constructor(private http: HttpClient) {}

  getDashboardCounts(): Observable<DashboardCountsDto> {
    return this.http.get<DashboardCountsDto>(`${this.baseUrl}/counts`);
  }
}
