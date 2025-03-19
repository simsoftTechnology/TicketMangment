import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Priorite } from '../_models/priorite.model';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class PrioriteService {
  baseUrl = environment.URLAPI+'priorites/';

  constructor(private http: HttpClient) { }

  getPriorites(): Observable<Priorite[]> {
    return this.http.get<Priorite[]>(this.baseUrl);
  }
}
