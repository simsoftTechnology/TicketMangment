import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Qualification } from '../_models/qualification.model';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class QualificationService {
  private   baseUrl = environment.URLAPI+'qualifications/'; // à adapter

  constructor(private http: HttpClient) { }

  getQualifications(): Observable<Qualification[]> {
    return this.http.get<Qualification[]>(this.baseUrl);
  }
}
