import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comment } from '../_models/comment';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private baseUrl = 'https://localhost:5001/api/commentaires'; 

  constructor(private http: HttpClient) {}

  // Récupérer les commentaires associés à un ticket
  getCommentsByTicket(ticketId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.baseUrl}/ticket/${ticketId}`);
  }

  // Ajouter un nouveau commentaire
  addComment(commentData: { contenu: string; ticketId: number }): Observable<Comment> {
    return this.http.post<Comment>(this.baseUrl, commentData);
  }
}
