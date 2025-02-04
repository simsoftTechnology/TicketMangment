import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Projet } from '../_models/Projet';
import { ProjetMember } from '../_models/projet-member';

@Injectable({
  providedIn: 'root'
})
export class ProjetService {
  private baseUrl = 'https://localhost:5001/api/projets';  // URL de votre API

  constructor(private http: HttpClient) { }

  // Récupérer tous les projets
  getProjets(): Observable<Projet[]> {
    return this.http.get<Projet[]>(`${this.baseUrl}`);
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

  // Ajouter un utilisateur à un projet
  ajouterUtilisateurAuProjet(projetId: number, userId: number, role: string): Observable<void> {
    const body = { userId: userId, role: role };
    return this.http.post<void>(`${this.baseUrl}/${projetId}/utilisateurs`, body);
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


}
