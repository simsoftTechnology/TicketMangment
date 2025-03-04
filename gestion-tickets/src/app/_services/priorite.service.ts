import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Priorite } from '../_models/priorite.model';

@Injectable({
  providedIn: 'root'
})
export class PrioriteService {
  private baseUrl = 'https://localhost:5001/api/priorites'; // à adapter

  constructor(private http: HttpClient) { }

  getPriorites(): Observable<Priorite[]> {
    return this.http.get<Priorite[]>(this.baseUrl);
  }
}
