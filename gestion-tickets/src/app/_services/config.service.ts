
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
//   _baseUrl: string;

  constructor(public dialog: MatDialog, private http: HttpClient) {
    this.getBaseUrl();
  }

  /******Read Config.json*******/

  public getBaseUrl(): Observable<any> {
    
    return this.http.get('./assets/config/app-config.json').pipe(
      map((res: any) => {
              
        return res;
      })
    );
  }
}
