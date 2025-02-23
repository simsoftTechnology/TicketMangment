import { PaginatedResult } from './../_models/pagination';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { User } from '../_models/user';
import { map, Observable, tap } from 'rxjs';
import { Pays } from '../_models/pays';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private http = inject(HttpClient);
  baseUrl = 'https://localhost:5001/api/';
  currentUser = signal<User | null>(this.getUserFromLocalStorage());
  paginatedResult = signal<PaginatedResult<User[]> | null>(null);

  private getUserFromLocalStorage(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  login(model: any) {
    return this.http.post<User>(this.baseUrl + 'account/login', model).pipe(
      map(user => {
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUser.set(user);
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('user');
    this.currentUser.set(null);
  }



  register(model: any) {
    return this.http.post<User>(this.baseUrl + 'account/register', model).pipe(
      map(user => {
        return user;
      })
    )
  }

  getPays(): Observable<Pays[]> {
    return this.http.get<Pays[]>(this.baseUrl + 'users/pays');
  }
  
  setCurrentUser(user: User) {
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUser.set(user);
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl + 'users');
  }

  getUsers(pageNumber?: number, pageSize?: number, searchTerm?: string): Observable<PaginatedResult<User[]>> {
    let params = new HttpParams();
    if (pageNumber != null && pageSize != null) {
      params = params.append('pageNumber', pageNumber.toString());
      params = params.append('pageSize', pageSize.toString());
    }
    if (searchTerm && searchTerm.trim() !== '') {
      params = params.append('searchTerm', searchTerm);
    }

    // Notez le 'paged' dans l'URL pour correspondre à votre backend.
    return this.http.get<User[]>(this.baseUrl + 'users/paged', { observe: 'response', params })
      .pipe(
        map((response: HttpResponse<User[]>) => {
          const paginatedResult: PaginatedResult<User[]> = {
            items: response.body || [],
            pagination: response.headers.get('Pagination')
              ? JSON.parse(response.headers.get('Pagination')!)
              : null!
          };
          return paginatedResult;
        })
      );
  }
  


  deleteUser(id: number): Observable<any> {
    return this.http.delete(this.baseUrl + 'users/' + id).pipe(
      tap(() => {
        // Si l'utilisateur supprimé est l'utilisateur actuel, déconnecter
        if (this.currentUser()?.id === id) {
          this.logout();
        }
      })
    );
  }

  validateToken(): Observable<void> {
    return this.http.get<void>(this.baseUrl + 'account/validate');
  }
  
}
