import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  private _loading = new BehaviorSubject<boolean>(false);
  public loading$: Observable<boolean> = this._loading.asObservable();

  show(): void {
    this._loading.next(true);
  }

  hide(): void {
    this._loading.next(false);
  }
}
