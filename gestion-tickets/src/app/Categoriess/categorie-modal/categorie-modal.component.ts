import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoaderService } from '../../_services/loader.service';
import { AccountService } from '../../_services/account.service';

@Component({
    selector: 'app-categorie-modal',
    imports: [FormsModule, CommonModule],
    templateUrl: './categorie-modal.component.html',
    styleUrls: ['./categorie-modal.component.css']
})
export class CategorieModalComponent {
  categoryName: string = '';
  isLoading: boolean = false;

  @Output() categoryAdded = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();

  constructor(
    private loaderService: LoaderService,
    private accountSer: AccountService,
  ) {
    this.loaderService.isLoading$.subscribe((loading) => {
      this.isLoading = loading;
    });
  }
  addCategory(): void {
    this.loaderService.showLoader();
    this.categoryAdded.emit(this.accountSer.removeSpecial(this.categoryName.trim()));
    
    this.loaderService.hideLoader();
    this.categoryName = '';
  }

  onBackdropClick(): void {
    this.close.emit();
  }
}
