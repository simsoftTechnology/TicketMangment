import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Role } from '../_models/role.model';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private baseUrl = 'https://localhost:5001/api/roles'; // à adapter

  constructor(private http: HttpClient) { }

  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.baseUrl);
  }
}
