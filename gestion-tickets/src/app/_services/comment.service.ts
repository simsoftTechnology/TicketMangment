import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comment } from '../_models/comment';
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
  addComment(commentData: { contenu: string; ticketId: number }): Observable<Comment> {
    return this.http.post<Comment>(this.baseUrl, commentData);
  }

}
