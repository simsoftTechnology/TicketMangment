import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Societe } from '../_models/societe';

@Injectable({
  providedIn: 'root'
})
export class SocieteService {
  private apiUrl = 'https://localhost:5001/api/societe'; 

  constructor(private http: HttpClient) {}

  getSocietes(): Observable<Societe[]> {
    return this.http.get<Societe[]>(this.apiUrl);
  }

  getSociete(id: number): Observable<Societe> {
    return this.http.get<Societe>(`${this.apiUrl}/${id}`);
  }

  addSociete(societe: Societe): Observable<Societe> {
    return this.http.post<Societe>(this.apiUrl, societe);
  }

  updateSociete(id: number, societe: Societe): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, societe);
  }

  deleteSociete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
