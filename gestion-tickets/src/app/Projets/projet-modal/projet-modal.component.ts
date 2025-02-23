import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-projet-modal',
  standalone: true,
  imports: [],
  templateUrl: './projet-modal.component.html',
  styleUrl: './projet-modal.component.css'
})
export class ProjetModalComponent {
  /**
   * Émet true si "Société" est sélectionné,
   * false si "Client" est sélectionné.
   */
  @Output() projectTypeSelected = new EventEmitter<boolean>();

  /**
   * Émet un événement lorsque l'utilisateur clique sur le fond pour fermer la modale.
   */
  @Output() close = new EventEmitter<void>();

  selectProjectType(isSociete: boolean): void {
    this.projectTypeSelected.emit(isSociete);
  }

  onBackdropClick(): void {
    this.close.emit();
  }
}
