import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Projet } from '../_models/Projet';
import { ProjetMember } from '../_models/projet-member';
import { PaginatedResult, Pagination } from '../_models/pagination';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class ProjetService {
   baseUrl = environment.URLAPI+'projets/';

  paginatedResult: PaginatedResult<Projet[]> | null = null;
  constructor(private http: HttpClient) { }

  // Récupérer tous les projets
  getProjets(): Observable<Projet[]> {
    return this.http.get<Projet[]>(`${this.baseUrl}`);
  }

   // Méthode pour récupérer les projets paginés
   getPaginatedProjets(
    pageNumber?: number,
    pageSize?: number,
    searchTerm?: string,
    societeId?: number
  ): Observable<PaginatedResult<Projet[]>> {
    const params = {
      pageNumber: pageNumber,
      pageSize: pageSize,
      searchTerm: searchTerm
    };
    return this.http.post<any>(environment.URLAPI + 'Projets/paged', params, { observe: 'response' })
      .pipe(
        map((response: HttpResponse<any>) => {
          // Now response.headers is available
          const paginationHeader = response.headers.get('Pagination'); 
          
          const paginatedResult: PaginatedResult<Projet[]> = {
            items: response.body || [],
            pagination: paginationHeader ? JSON.parse(paginationHeader) : {} as Pagination
          };
          return paginatedResult;
        })
      );
 
  }
  
  

  // Récupérer un projet par ID
  getProjetById(id: number): Observable<Projet> {
    return this.http.get<Projet>(`${this.baseUrl}${id}`);
  }

  // Ajouter un nouveau projet
  addProjet(projet: Projet): Observable<Projet> {
    return this.http.post<Projet>(`${this.baseUrl}ajouterProjet`, projet);
  }

  // Mettre à jour un projet
  updateProjet(projet: Projet): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}modifierProjet/${projet.id}`, projet);
  }


  // Supprimer un projet
  deleteProjet(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}supprimerProjet/${id}`);
  }

  deleteSelectedProjets(ids: number[]): Observable<any> {
    // On utilise http.request pour pouvoir envoyer un body avec la méthode DELETE
    return this.http.request('delete', `${this.baseUrl}supprimerProjets`, { body: ids });
  }

  // Ajouter un utilisateur à un projet
  ajouterUtilisateurAuProjet(projetId: number, userId: number, role: string): Observable<void> {
    const body = { userId: userId, role: role };
    return this.http.post<void>(`${this.baseUrl}${projetId}/utilisateurs`, body);
  }

  // Récupérer les membres d'un projet
  getMembresProjet(projetId: number): Observable<ProjetMember[]> {
    return this.http.get<ProjetMember[]>(`${this.baseUrl}membres/${projetId}`);
  }

  getUserProjets(): Observable<Projet[]> {
    return this.http.get<Projet[]>(`${this.baseUrl}user`);
  }
  
  // Assigner ou mettre à jour le rôle d'un utilisateur dans un projet
  assignerRole(projetId: number, userId: number, role: string): Observable<any> {
    // Ici, selon votre API, vous pouvez soit utiliser un endpoint dédié (par exemple assigner-role)
    // ou réutiliser l'endpoint d'ajout d'utilisateur. Dans cet exemple, on suppose un endpoint dédié.
    const body = { projetId, userId, role };
    return this.http.post<any>(`${this.baseUrl}assigner-role`, null, {
      params: { projetId: projetId.toString(), userId: userId.toString(), role }
    });
  }

  // Supprimer un utilisateur d'un projet
  supprimerUtilisateurDuProjet(projetId: number, userId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}${projetId}/utilisateurs/${userId}`);
  }
  

  deleteSelectedProjectMembers(projetId: number, userIds: number[]): Observable<any> {
    // On utilise http.request('delete') pour envoyer un body avec la méthode DELETE.
    return this.http.request('delete', `${this.baseUrl}supprimerUtilisateursDuProjet`, {
      body: { projetId, userIds }
    });
  }

  getProjetsBySocieteId(societeId: number): Observable<Projet[]> {
    return this.http.get<Projet[]>(`${this.baseUrl}/societe/${societeId}`);
  }
  
}
