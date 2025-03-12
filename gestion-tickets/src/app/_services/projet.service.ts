import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { catchError, map, Observable } from 'rxjs';
import { Projet } from '../_models/Projet';
import { ProjetMember } from '../_models/projet-member';
import { PaginatedResult } from '../_models/pagination';

@Injectable({
  providedIn: 'root'
})
export class ProjetService {
  private baseUrl = 'https://localhost:5001/api/projets';  // URL de votre API

  paginatedResult: PaginatedResult<Projet[]> | null = null;
  constructor(private http: HttpClient) { }

  // Récupérer tous les projets
  getProjets(): Observable<Projet[]> {
    return this.http.get<Projet[]>(`${this.baseUrl}`);
  }

   // Méthode pour récupérer les projets paginés
   getPaginatedProjets(pageNumber?: number, pageSize?: number, searchTerm?: string): Observable<PaginatedResult<Projet[]>> {
    let params = new HttpParams();
    if (pageNumber != null && pageSize != null) {
      params = params.append('pageNumber', pageNumber.toString());
      params = params.append('pageSize', pageSize.toString());
    }
    if (searchTerm && searchTerm.trim() !== '') {
      params = params.append('searchTerm', searchTerm);
    }
  
    return this.http.get<Projet[]>(this.baseUrl + '/paged', { observe: 'response', params })
      .pipe(
        map((response: HttpResponse<Projet[]>) => {
          const paginatedResult: PaginatedResult<Projet[]> = {
            items: response.body || [],
            pagination: response.headers.get('Pagination') 
              ? JSON.parse(response.headers.get('Pagination')!) 
              : null!
          };
          this.paginatedResult = paginatedResult;
          return paginatedResult;
        })
      );
  }
  

  // Récupérer un projet par ID
  getProjetById(id: number): Observable<Projet> {
    return this.http.get<Projet>(`${this.baseUrl}/${id}`);
  }

  // Ajouter un nouveau projet
  addProjet(projet: Projet): Observable<Projet> {
    return this.http.post<Projet>(`${this.baseUrl}/ajouterProjet`, projet);
  }

  // Mettre à jour un projet
  updateProjet(projet: Projet): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/modifierProjet/${projet.id}`, projet);
  }


  // Supprimer un projet
  deleteProjet(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/supprimerProjet/${id}`);
  }

  deleteSelectedProjets(ids: number[]): Observable<any> {
    // On utilise http.request pour pouvoir envoyer un body avec la méthode DELETE
    return this.http.request('delete', `${this.baseUrl}/supprimerProjets`, { body: ids });
  }

  // Ajouter un utilisateur à un projet
  ajouterUtilisateurAuProjet(projetId: number, userId: number): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/api/projets/${projetId}/utilisateurs`,
      { userId } // Corriger le payload si nécessaire
    ).pipe(
      catchError((error) => {
        if (error.status === 409) {
          // Gérer spécifiquement le conflit
          throw new Error('Cet utilisateur est déjà associé au projet.');
        }
        throw error;
      })
    );
  }

  // Récupérer les membres d'un projet
  getMembresProjet(projetId: number): Observable<ProjetMember[]> {
    return this.http.get<ProjetMember[]>(`${this.baseUrl}/membres/${projetId}`);
  }

  // Assigner ou mettre à jour le rôle d'un utilisateur dans un projet
  assignerRole(projetId: number, userId: number, role: string): Observable<any> {
    // Ici, selon votre API, vous pouvez soit utiliser un endpoint dédié (par exemple assigner-role)
    // ou réutiliser l'endpoint d'ajout d'utilisateur. Dans cet exemple, on suppose un endpoint dédié.
    const body = { projetId, userId, role };
    return this.http.post<any>(`${this.baseUrl}/assigner-role`, null, {
      params: { projetId: projetId.toString(), userId: userId.toString(), role }
    });
  }

  // Supprimer un utilisateur d'un projet
  supprimerUtilisateurDuProjet(projetId: number, userId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${projetId}/utilisateurs/${userId}`);
  }
  

  deleteSelectedProjectMembers(projetId: number, userIds: number[]): Observable<any> {
    // On utilise http.request('delete') pour envoyer un body avec la méthode DELETE.
    return this.http.request('delete', `${this.baseUrl}/supprimerUtilisateursDuProjet`, {
      body: { projetId, userIds }
    });
  }
  
}
