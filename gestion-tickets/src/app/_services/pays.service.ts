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
    const body = { searchTerm: searchTerm || '' };
    return this.http.post<Pays[]>(`${this.baseUrl}pays/getPays`, body).pipe(
      map(paysList =>
        paysList.map(pays => {
          if (pays.photoUrl) {
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
  
  

  private toBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }
  
  async addPays(nom: string, codeTel: string, file: File): Promise<Observable<any>> {
    const fileBase64 = await this.toBase64(file);
    const body = { nom, codeTel, file: fileBase64 };
    return this.http.post(`${this.baseUrl}pays/ajouterPays`, body);
  }
  
  

  async updatePays(idPays: number, paysUpdateDto: { nom: string; codeTel: string }, file?: File): Promise<Observable<any>> {
    let fileBase64: string | undefined;
    if (file) {
      fileBase64 = await this.toBase64(file);
    }
    const body: any = { 
      nom: paysUpdateDto.nom, 
      codeTel: paysUpdateDto.codeTel,
      file: fileBase64 
    };
    return this.http.post(`${this.baseUrl}pays/ModifierPays/${idPays}`, body);
  }
  
  

  deletePays(idPays: number): Observable<any> {
    return this.http.get(`${this.baseUrl}pays/supprimerPays/${idPays}`);
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
