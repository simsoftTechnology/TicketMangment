import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-projet-modal',
  standalone: true,
  imports: [],
  templateUrl: './projet-modal.component.html',
  styleUrls: ['./projet-modal.component.css']
})
export class ProjetModalComponent {
  @Output() projectTypeSelected = new EventEmitter<boolean>();
  @Output() close = new EventEmitter<void>();

  selectProjectType(isSociete: boolean): void {
    this.projectTypeSelected.emit(isSociete);
  }

  onBackdropClick(): void {
    this.close.emit();
  }
}
