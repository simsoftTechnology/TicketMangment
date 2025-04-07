import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Pays } from '../_models/pays';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class PaysService {
   baseUrl = environment.URLAPI;

  constructor(private http: HttpClient) {}

  // Méthode pour récupérer les pays, avec possibilité de recherche
  getPays(searchTerm?: string): Observable<Pays[]> {
    let params = new HttpParams();
    if (searchTerm && searchTerm.trim() !== '') {
      params = params.append('searchTerm', searchTerm);
    }
    return this.http.get<Pays[]>(`${this.baseUrl}pays/getPays`, { params }).pipe(
      map((paysList) =>
        paysList.map((pays) => {
          if (pays.photoUrl) {
            // Remplacer les antislashs par des slashs et ajouter l'URL de base
            pays.photoUrl = `https://support.simsoft.tn:8055/${pays.photoUrl.replace(/\\/g, '/')}`;
          }
          return pays;
        })
      )
    );
  }

  getPaysById(idPays: number): Observable<Pays> {
    return this.http.get<Pays>(`${this.baseUrl}pays/${idPays}`).pipe(
      map((pays) => {
        if (pays.photoUrl) {
          pays.photoUrl = `https://support.simsoft.tn:8055/${pays.photoUrl.replace(/\\/g, '/')}`;
        }
        return pays;
      })
    );
  }
  
  

  addPays(nom: string, codeTel: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('nom', nom);
    formData.append('codeTel', codeTel);
    formData.append('file', file);

    return this.http.post(`${this.baseUrl}pays/ajouterPays`, formData);
  }
  
  

  updatePays(idPays: number, paysUpdateDto: { nom: string; codeTel: string }, file?: File): Observable<any> {
    const formData = new FormData();
    formData.append('nom', paysUpdateDto.nom);
    formData.append('codeTel', paysUpdateDto.codeTel);
  
    if (file) {
      formData.append('file', file); // Ajouter le fichier si fourni
    }
  
    return this.http.put(`${this.baseUrl}pays/ModifierPays/${idPays}`, formData);
  }
  

  deletePays(idPays: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}pays/supprimerPays/${idPays}`);
  }
  
  

  addPhoto(paysId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file); // Ajouter le fichier au formulaire
    formData.append('paysId', paysId.toString()); // Associer l'ID du pays

    return this.http.post(`${this.baseUrl}pays/${paysId}/add-photo`, formData);
  }


  updatePhoto(paysId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
  
    return this.http.put(`${this.baseUrl}pays/${paysId}/modifier-photo`, formData);
  }
  
}
