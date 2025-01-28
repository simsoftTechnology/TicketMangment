import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pays } from '../_models/pays';

@Injectable({
  providedIn: 'root',
})
export class PaysService {
  private baseUrl = 'https://localhost:5001/api'; // Remplacez par l'URL de votre API

  constructor(private http: HttpClient) {}

  getPays(): Observable<Pays[]> {
    return this.http.get<Pays[]>(`${this.baseUrl}/users/pays`);
  }

  addPays(nom: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('nom', nom);
    formData.append('file', file);

    return this.http.post(`${this.baseUrl}/users/ajouterPays`, formData);
  }
  

  updatePays(idPays: number, paysUpdateDto: { nom: string }, file?: File): Observable<any> {
    const formData = new FormData();
    formData.append('nom', paysUpdateDto.nom);
  
    if (file) {
      formData.append('file', file); // Ajouter le fichier si fourni
    }
  
    return this.http.put(`${this.baseUrl}/users/ModifierPays/${idPays}`, formData);
  }

  deletePays(idPays: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/users/supprimerPays/${idPays}`);
  }
  
  

  addPhoto(paysId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file); // Ajouter le fichier au formulaire
    formData.append('paysId', paysId.toString()); // Associer l'ID du pays

    return this.http.post(`${this.baseUrl}/users/${paysId}/add-photo`, formData);
  }


  updatePhoto(paysId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
  
    return this.http.put(`${this.baseUrl}/users/${paysId}/modifier-photo`, formData);
  }
  
}
