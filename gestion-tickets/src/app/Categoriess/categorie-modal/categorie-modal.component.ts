import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-categorie-modal',
    imports: [FormsModule, CommonModule],
    templateUrl: './categorie-modal.component.html',
    styleUrls: ['./categorie-modal.component.css']
})
export class CategorieModalComponent {
  categoryName: string = '';

  @Output() categoryAdded = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();

  addCategory(): void {
    this.categoryAdded.emit(this.categoryName.trim());
    this.categoryName = '';
  }

  onBackdropClick(): void {
    this.close.emit();
  }
}
