import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SearchResultDTO {
  id: number;
  type: string;
  title: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private apiUrl = 'https://support.simsoft.tn:8055/api/search'; // Assurez-vous que l'URL correspond à celle définie côté backend

  constructor(private http: HttpClient) {}

  search(query: string): Observable<SearchResultDTO[]> {
    return this.http.get<SearchResultDTO[]>(`${this.apiUrl}?query=${encodeURIComponent(query)}`);
  }
}
