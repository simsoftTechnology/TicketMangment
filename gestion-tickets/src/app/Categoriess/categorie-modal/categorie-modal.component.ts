import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-categorie-modal',
  standalone: true,
  imports: [ FormsModule],
  templateUrl: './categorie-modal.component.html',
  styleUrl: './categorie-modal.component.css'
})
export class CategorieModalComponent {
  categoryName: string = '';

  @Output() categoryAdded = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();

  addCategory(): void {
    if (this.categoryName.trim() === '') {
      alert('Veuillez saisir un nom de catégorie.');
      return;
    }
    // Émettre l'événement avec le nom de la catégorie
    this.categoryAdded.emit(this.categoryName.trim());
    // Réinitialiser le champ ou fermer le modal si besoin
    this.categoryName = '';
  }

  onBackdropClick(): void {
    this.close.emit();
  }
}