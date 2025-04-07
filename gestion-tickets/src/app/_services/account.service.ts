import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { PaginatedResult, Pagination } from './../_models/pagination';
import { User } from '../_models/user';
import { Pays } from '../_models/pays';
import { Projet } from '../_models/Projet';
import { Ticket } from '../_models/ticket';
import { environment } from '../../environment/environment';
import { ConfigService } from './config.service';
@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private http = inject(HttpClient);
  baseUrl = environment.URLAPI;
  currentUser = signal<User | null>(this.getUserFromLocalStorage());
  paginatedResult = signal<PaginatedResult<User[]> | null>(null);

  constructor(private config: ConfigService){}
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
      map(user => user)
    );
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

  getUsers(pageNumber?: number, pageSize?: number, searchTerm?: string): Observable<PaginatedResult<any>> {
    const params = {
      pageNumber: pageNumber,
      pageSize: pageSize,
      searchTerm: searchTerm
    };
  
    return this.http.post<any>(environment.URLAPI + 'users/paged', params, { observe: 'response' })
      .pipe(
        map((response: HttpResponse<any>) => {
          // Now response.headers is available
          const paginationHeader = response.headers.get('Pagination');  
          const paginatedResult: PaginatedResult<User[]> = {
            items: response.body || [],
            pagination: paginationHeader ? JSON.parse(paginationHeader) : {} as Pagination
          };
          return paginatedResult;
        })
      );
  }
  

  getUser(id: number): Observable<User> {
    return this.http.get<User>(this.baseUrl + 'users/' + id);
  }

  updateUser(user: User): Observable<any> {
    return this.http.put(this.baseUrl + 'users/' + user.id, user);
  }

  getUserProjects(
    userId: number,
    pageNumber: number,
    pageSize: number,
    searchTerm?: string
  ): Observable<PaginatedResult<Projet[]>> {
    const params = {
      pageNumber,
      pageSize,
      searchTerm: searchTerm ? searchTerm : ''
    };
  
    return this.http.post<any>(
      `${this.baseUrl}users/${userId}/projects/paged`,
      params,
      { observe: 'response' }
    ).pipe(
      map((response: HttpResponse<any>) => {
        const paginationHeader = response.headers.get('Pagination');
  
        const paginatedResult: PaginatedResult<Projet[]> = {
          items: response.body || [],
          pagination: paginationHeader ? JSON.parse(paginationHeader) : {} as Pagination
        };
        return paginatedResult;
      })
    );
  }
  

  getUserTickets(
    userId: number,
    pageNumber: number,
    pageSize: number,
    searchTerm?: string
  ): Observable<PaginatedResult<Ticket[]>> {
    const params = {
      pageNumber,
      pageSize,
      searchTerm: searchTerm ? searchTerm : ''
    };
  
    return this.http.post<any>(
      `${this.baseUrl}users/${userId}/tickets/paged`,
      params,
      { observe: 'response' }
    ).pipe(
      map((response: HttpResponse<any>) => {
        const paginationHeader = response.headers.get('Pagination');
  
        const paginatedResult: PaginatedResult<Ticket[]> = {
          items: response.body || [],
          pagination: paginationHeader ? JSON.parse(paginationHeader) : {} as Pagination
        };
        return paginatedResult;
      })
    );
  } 


  deleteUser(id: number): Observable<any> {
    return this.http.delete(this.baseUrl + 'users/' + id).pipe(
      tap(() => {
        if (this.currentUser()?.id === id) {
          this.logout();
        }
      })
    );
  }

  validateToken(): Observable<void> {
    return this.http.get<void>(this.baseUrl + 'account/validate');
  }

  getUsersByRole(roleName: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}users/role/${roleName}`);
  }
  
}
