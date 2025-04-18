import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Role } from '../_models/role.model';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private   baseUrl = environment.URLAPI+'roles/'; // à adapter

  constructor(private http: HttpClient) { }

  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.baseUrl);
  }
}
