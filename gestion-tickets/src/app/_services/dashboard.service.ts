import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { DashboardCountsDto } from '../_models/dashboardCountsDto';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService { 
   baseUrl = environment.URLAPI+'dashboard';

  constructor(private http: HttpClient) {}

  getDashboardCounts(): Observable<DashboardCountsDto> {
    return this.http.get<DashboardCountsDto>(`${this.baseUrl}/counts`);
  }
}
