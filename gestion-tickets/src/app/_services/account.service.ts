import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { PaginatedResult, Pagination } from './../_models/pagination';
import { User } from '../_models/user';
import { Pays } from '../_models/pays';
import { Projet } from '../_models/Projet';
import { Ticket } from '../_models/ticket';

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

  getUsers(
    pageNumber: number, 
    pageSize: number, 
    searchTerm?: string, 
    extraFilters?: any
  ): Observable<PaginatedResult<User[]>> {
    let params = new HttpParams()
      .append('pageNumber', pageNumber.toString())
      .append('pageSize', pageSize.toString());
  
    if (searchTerm && searchTerm.trim() !== '') {
      params = params.append('searchTerm', searchTerm);
    }
    
    if (extraFilters) {
      if (extraFilters.role) {
        params = params.append('role', extraFilters.role);
      }
      if (extraFilters.actif != null) {
        // Pour les booléens, convertissez en chaîne
        params = params.append('actif', extraFilters.actif.toString());
      }
      if (extraFilters.hasContract != null) {
        params = params.append('hasContract', extraFilters.hasContract.toString());
      }
    }
    
    return this.http.get<User[]>(this.baseUrl + 'users/paged', { observe: 'response', params })
      .pipe(
        map((response: HttpResponse<User[]>) => {
          const paginatedResult: PaginatedResult<User[]> = {
            items: response.body || [],
            pagination: response.headers.get('Pagination')
              ? JSON.parse(response.headers.get('Pagination')!)
              : {} as Pagination
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

  getUserProjects(userId: number, pageNumber: number, pageSize: number, searchTerm?: string): Observable<PaginatedResult<Projet[]>> {
    let params = new HttpParams()
      .append('pageNumber', pageNumber.toString())
      .append('pageSize', pageSize.toString());
    if (searchTerm && searchTerm.trim() !== '') {
      params = params.append('searchTerm', searchTerm);
    }
    return this.http.get<Projet[]>(`${this.baseUrl}users/${userId}/projects/paged`, { observe: 'response', params })
      .pipe(
        map((response: HttpResponse<Projet[]>) => {
          const paginatedResult: PaginatedResult<Projet[]> = {
            items: response.body || [],
            pagination: response.headers.get('Pagination')
              ? JSON.parse(response.headers.get('Pagination')!)
              : {} as Pagination
          };
          return paginatedResult;
        })
      );
  }

  getUserTickets(userId: number, pageNumber: number, pageSize: number, searchTerm?: string): Observable<PaginatedResult<Ticket[]>> {
    let params = new HttpParams()
      .append('pageNumber', pageNumber.toString())
      .append('pageSize', pageSize.toString());
    if (searchTerm && searchTerm.trim() !== '') {
      params = params.append('searchTerm', searchTerm);
    }
    return this.http.get<Ticket[]>(`${this.baseUrl}users/${userId}/tickets/paged`, { observe: 'response', params })
      .pipe(
        map((response: HttpResponse<Ticket[]>) => {
          const paginatedResult: PaginatedResult<Ticket[]> = {
            items: response.body || [],
            pagination: response.headers.get('Pagination')
              ? JSON.parse(response.headers.get('Pagination')!)
              : {} as Pagination
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

  exportUsers(searchTerm: string, extraFilters: any): Observable<Blob> {
    let params = new HttpParams();
    if (searchTerm && searchTerm.trim() !== '') {
      params = params.append('searchTerm', searchTerm);
    }
    if (extraFilters) {
      if (extraFilters.role) {
        params = params.append('role', extraFilters.role);
      }
      if (extraFilters.actif != null) {
        params = params.append('actif', extraFilters.actif.toString());
      }
      if (extraFilters.hasContract != null) {
        params = params.append('hasContract', extraFilters.hasContract.toString());
      }
    }
    return this.http.get(this.baseUrl + 'users/export', { params, responseType: 'blob' });
  }
  
  
}
