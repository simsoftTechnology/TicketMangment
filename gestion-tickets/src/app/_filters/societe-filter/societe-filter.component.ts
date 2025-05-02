import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { PaysService } from '../../_services/pays.service';
import { Pays } from '../../_models/pays';
import { LoaderService } from '../../_services/loader.service';

@Component({
  selector: 'app-societe-filter',
  imports: [ ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './societe-filter.component.html',
  styleUrl: './societe-filter.component.css'
})
export class SocieteFilterComponent implements OnInit {
  filterForm!: FormGroup;
  @Output() applyFilter = new EventEmitter<any>();

  // Options pour le champ pays (sera rempli dynamiquement depuis la base)
  paysOptions: string[] = [];
  filteredPays: string[] = [];
  selectedPays: string = 'Tous';
  paysSearchTerm: string = '';
  isPaysDropdownOpen: boolean = false;

  isLoading: boolean = false;

  constructor(private fb: FormBuilder, private paysService: PaysService,
    private loaderService: LoaderService) {
    this.loaderService.isLoading$.subscribe((loading) => {
      this.isLoading = loading;
    });
  }

  ngOnInit(): void {
    // Initialisation du formulaire
    this.filterForm = this.fb.group({
      pays: ['Tous']
    });

    // Récupération de la liste des pays depuis l'API
    this.paysService.getPays().subscribe({
      next: (paysList: Pays[]) => {
        // On peut par exemple ne récupérer que le nom des pays
        this.paysOptions = ['Tous', ...paysList.map(p => p.nom)];
        this.filteredPays = [...this.paysOptions];
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des pays', error);
        // En cas d'erreur, vous pouvez définir une liste par défaut
        this.paysOptions = ['Tous'];
        this.filteredPays = [...this.paysOptions];
      }
    });
  }

  onSubmit(): void {
    const filterValues = this.filterForm.value;
    // Transformation de "Tous" en null pour ne pas appliquer de filtre
    filterValues.pays = filterValues.pays === 'Tous' ? null : filterValues.pays;
    this.loaderService.showLoader();
    this.applyFilter.emit(this.filterForm.value);
    this.loaderService.hideLoader();
  }

  onReset(): void {
    this.filterForm.reset({
      pays: 'Tous'
    });
    this.selectedPays = 'Tous';
    this.applyFilter.emit({});
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.isPaysDropdownOpen = !this.isPaysDropdownOpen;
  }

  filterPays(): void {
    const term = this.paysSearchTerm.toLowerCase();
    this.filteredPays = this.paysOptions.filter(p => p.toLowerCase().includes(term));
  }

  selectPays(item: string): void {
    this.selectedPays = item;
    this.filterForm.patchValue({ pays: item });
    this.isPaysDropdownOpen = false;
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.isPaysDropdownOpen = false;
  }
}