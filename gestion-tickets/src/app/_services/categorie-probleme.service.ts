import { Injectable } from '@angular/core'; 
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { CategorieProbleme } from '../_models/categorie-probleme.model';
import { PaginatedResult, Pagination } from '../_models/pagination';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategorieProblemeService {
  private baseUrl = environment.apiUrl+"CategorieProbleme";
  constructor(private http: HttpClient) {}

  // Récupère toutes les catégories (non paginées)
  getCategories(): Observable<CategorieProbleme[]> {
    return this.http.get<CategorieProbleme[]>(this.baseUrl);
  }

  // Récupère les catégories paginées
  getCategoriesPaginated(
    pageNumber: number,
    pageSize: number,
    searchTerm: string = '',
    extraFilters?: any
  ): Observable<PaginatedResult<CategorieProbleme[]>> {
    const params = {
      pageNumber,
      pageSize,
      searchTerm,
      ...extraFilters
    };
  
    return this.http.post<any>(`${this.baseUrl}/paged`, params, { observe: 'response' })
      .pipe(
        map((response: HttpResponse<CategorieProbleme[]>) => {
          const paginationHeader = response.headers.get('Pagination');
          const paginatedResult: PaginatedResult<CategorieProbleme[]> = {
            items: response.body || [],
            pagination: paginationHeader ? JSON.parse(paginationHeader) : {} as Pagination
          };
          return paginatedResult;
        })
      );
  }

  // Récupère une catégorie par ID
  getCategoryById(id: number): Observable<CategorieProbleme> {
    return this.http.get<CategorieProbleme>(`${this.baseUrl}/${id}`);
  }

  // Ajoute une nouvelle catégorie
  addCategory(category: CategorieProbleme): Observable<CategorieProbleme> {
    return this.http.post<CategorieProbleme>(this.baseUrl, category);
  }

  // Met à jour une catégorie existante
  updateCategory(category: CategorieProbleme): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${category.id}`, category);
  }

  // Supprime une catégorie par ID
  deleteCategory(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}delete/${id}`);
  }

  // Supprime plusieurs catégories à la fois
  deleteSelectedCategories(ids: number[]): Observable<any> {
    // Utilisation de la méthode http.request afin d'envoyer un body avec la requête DELETE
    return this.http.request('get', `${this.baseUrl}deleteMultiple`, { body: ids });
  }

  exportCategories(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/export`, { responseType: 'blob' });
  }
}
