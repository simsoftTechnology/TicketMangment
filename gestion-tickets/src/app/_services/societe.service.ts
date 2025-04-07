import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Societe } from '../_models/societe';
import { PaginatedResult, Pagination } from '../_models/pagination';
import { User } from '../_models/user';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class SocieteService {
  getSocieteById(societeId: number) {
    throw new Error('Method not implemented.');
  }
  private apiUrl = environment.URLAPI+'societe/'; 
  paginatedResult: PaginatedResult<Societe[]> | null = null;

  constructor(private http: HttpClient) {}

  getSocietes(searchTerm?: string): Observable<Societe[]> {
    let params = new HttpParams();
    if (searchTerm && searchTerm.trim() !== '') {
      params = params.append('searchTerm', searchTerm);
    }
    return this.http.get<Societe[]>(this.apiUrl, { params });
  }

  // Méthode pour récupérer les projets paginés
  getPaginatedSocietes(pageNumber?: number, pageSize?: number, searchTerm?: string): Observable<PaginatedResult<Societe[]>> {
    const params = {
      pageNumber: pageNumber,
      pageSize: pageSize,
      searchTerm: searchTerm
    };
    return this.http.post<any>(this.apiUrl + 'paged', params, { observe: 'response' })
      .pipe(
        map((response: HttpResponse<any>) => { 
          const paginationHeader = response.headers.get('Pagination');  
          const paginatedResult: PaginatedResult<Societe[]> = {
            items: response.body || [],
            pagination: paginationHeader ? JSON.parse(paginationHeader) : {} as Pagination
          };
          return paginatedResult;
        })
      );  
  }  
  

  getSociete(id: number): Observable<Societe> {
    return this.http.get<Societe>(`${this.apiUrl}${id}`);
  }

  getSocieteDetails(id: number): Observable<Societe> {
    return this.http.get<Societe>(`${this.apiUrl}details/${id}`);
  }

  addSociete(societe: Societe): Observable<Societe> {
    return this.http.post<Societe>(this.apiUrl, societe);
  }

  updateSociete(id: number, societe: Societe): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}${id}`, societe);
  }

  deleteSociete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}`);
  }

  deleteSelectedSocietes(ids: number[]): Observable<void> {
    return this.http.request<void>('delete', `${this.apiUrl}supprimerSocietes`, { body: ids });
  }

  getSocieteUsersPaged(
    societeId: number, 
    pageNumber?: number, 
    pageSize?: number, 
    searchTerm?: string,
    extraFilters?: any
  ): Observable<PaginatedResult<User[]>> {
    const params = {
      pageNumber,
      pageSize,
      searchTerm: searchTerm ? searchTerm : '',
      ...extraFilters
    };
  
    return this.http.post<any>(`${this.apiUrl}/${societeId}/users/paged`, params, { observe: 'response' })
      .pipe(
        map((response: HttpResponse<User[]>) => {
          const paginationHeader = response.headers.get('Pagination');
          const paginatedResult: PaginatedResult<User[]> = {
            items: response.body || [],
            pagination: paginationHeader ? JSON.parse(paginationHeader) : {} as Pagination
          };
          return paginatedResult;
        })
      );
  }


  attachUser(societeId: number, userId: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}${societeId}/users/${userId}`,
      null,
      { responseType: 'text' }  // Précise que la réponse sera du texte
    ); 
  }
  
  
  detachUser(societeId: number, userId: number): Observable<any> {
  return this.http.delete(`${this.apiUrl}${societeId}/users/${userId}`, { responseType: 'text' });
}  
  
}
