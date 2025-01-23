import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SidenavService {
  private sidenavState = new BehaviorSubject<boolean>(true);  // Valeur par défaut true pour ouvert
  sidenavState$ = this.sidenavState.asObservable();

  toggleSidenav() {
    this.sidenavState.next(!this.sidenavState.value);
  }

  setSidenavState(state: boolean) {
    this.sidenavState.next(state);
  }
}
