import { PaginatedResult } from './../_models/pagination';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { User } from '../_models/user';
import { map, Observable } from 'rxjs';
import { Pays } from '../_models/pays';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private http = inject(HttpClient);
  baseUrl = 'https://localhost:5001/api/';
  currentUser = signal<User | null>(null);
  paginatedResult = signal<PaginatedResult<User[]> | null>(null);

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


  register(model: any) {
    return this.http.post<User>(this.baseUrl + 'account/register', model).pipe(
      map(user => {
        if (user) {
          this.setCurrentUser(user);
        }
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
    return this.http.get<User[]>(this.baseUrl + 'users/all');
  }

  getUsers(pageNumber?: number, pageSize?: number): Observable<PaginatedResult<User[]>> {
    let params = new HttpParams();
    if (pageNumber && pageSize) {
      params = params.append('pageNumber', pageNumber);
      params = params.append('pageSize', pageSize);
    }
  
    return this.http.get<User[]>(this.baseUrl + 'users', { observe: 'response', params }).pipe(
      map(response => {
        // Extract the pagination header and parse it
        const paginationHeader = response.headers.get('Pagination');
        if (paginationHeader) {
          const pagination = JSON.parse(paginationHeader);
          return {
            items: response.body as User[],
            pagination
          };
        } else {
          throw new Error('Pagination header is missing');
        }
      })
    );
  }
  
  
  logout() {
    localStorage.removeItem('user');
    this.currentUser.set(null);
  }
}
