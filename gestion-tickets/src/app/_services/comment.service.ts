import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, from, Observable, switchMap, throwError } from 'rxjs';
import { Comment, Commentexport } from '../_models/comment';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
    baseUrl = environment.URLAPI+'commentaires'; 

  constructor(private http: HttpClient) {}

  // Récupérer les commentaires associés à un ticket
  getCommentsByTicket(ticketId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.baseUrl}/ticket/${ticketId}`);
  }
  // addComment(commentData: { contenu: string; ticketId: number }): Observable<Comment> {
  //   return this.http.post<Comment>(this.baseUrl, commentData);
  // }
   addCommentwithAttachement(commentData: { contenu: string; ticketId: number, file?: File }, ): Observable<any> {
     var attachmentFileName="";
     var attachmentBase64 ="";
      const  comm: Commentexport= {
      contenu:commentData.contenu,
      ticketId:commentData.ticketId,
      attachmentBase64:"",
      attachmentFileName:"",

     }
     if (commentData.file) {
        return from(this.convertFileToBase64(commentData.file)).pipe(
          switchMap(base64 => {
             comm.attachmentBase64 = base64;
             comm.attachmentFileName = commentData.file? commentData.file.name : "";
            return this.http.post(this.baseUrl,comm );
          }),
          catchError(error => {
            console.error("Erreur lors de la conversion du fichier", error);
            return throwError(error);
          })
        );
      } else {
        return this.http.post(this.baseUrl, comm);
      }
 
  }
  // Convert file to base64 using a Promise; used internally by createTicket when needed.
  convertFileToBase64(file: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
    });
  }
 
    

}
