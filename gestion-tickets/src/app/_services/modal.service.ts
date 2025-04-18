// project-modal.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectModalService {
  private modalState = new Subject<boolean>();
  modalState$ = this.modalState.asObservable();

  setModalState(isOpen: boolean) {
    this.modalState.next(isOpen);
  }
}
