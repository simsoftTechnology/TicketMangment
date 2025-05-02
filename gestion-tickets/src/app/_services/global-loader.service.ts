import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GlobalLoaderService {
  private loadingCount = 0;
  private isGlobalLoadingSubject = new BehaviorSubject<boolean>(false);
  public isGlobalLoading$ = this.isGlobalLoadingSubject.asObservable();

  showGlobalLoader() {
    this.loadingCount++;
    this.isGlobalLoadingSubject.next(true);
  }

  hideGlobalLoader() {
    this.loadingCount = Math.max(this.loadingCount - 1, 0);
    if (this.loadingCount === 0) {
      this.isGlobalLoadingSubject.next(false);
    }
  }
}
