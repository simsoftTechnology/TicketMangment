import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Societe } from '../_models/societe';
import { PaginatedResult } from '../_models/pagination';

@Injectable({
  providedIn: 'root'
})
export class SocieteService {
  getSocieteById(societeId: number) {
    throw new Error('Method not implemented.');
  }
  private apiUrl = 'https://localhost:5001/api/societe'; 
  paginatedResult: PaginatedResult<Societe[]> | null = null;

  constructor(private http: HttpClient) {}

  getSocietes(): Observable<Societe[]> {
    return this.http.get<Societe[]>(this.apiUrl);
  }

  // Méthode pour récupérer les projets paginés
  getPaginatedSocietes(pageNumber?: number, pageSize?: number): Observable<PaginatedResult<Societe[]>> {
    let params = new HttpParams();
    if (pageNumber != null && pageSize != null) {
      params = params.append('pageNumber', pageNumber);
      params = params.append('pageSize', pageSize);
    }

    return this.http.get<Societe[]>(this.apiUrl + '/paged', { observe: 'response', params })
      .pipe(
        map((response: HttpResponse<Societe[]>) => {
          const paginatedResult: PaginatedResult<Societe[]> = {
            items: response.body || [],
            // On attend que le header 'Pagination' contienne une chaîne JSON
            pagination: response.headers.get('Pagination') ? JSON.parse(response.headers.get('Pagination')!) : null!
          };
          // Stocker le résultat pour une utilisation éventuelle dans le composant
          this.paginatedResult = paginatedResult;
          return paginatedResult;
        })
      );
  }

  getSociete(id: number): Observable<Societe> {
    return this.http.get<Societe>(`${this.apiUrl}/${id}`);
  }

  getSocieteDetails(id: number): Observable<Societe> {
    return this.http.get<Societe>(`${this.apiUrl}/details/${id}`);
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
