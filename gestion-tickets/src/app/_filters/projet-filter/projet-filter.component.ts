import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AccountService } from '../../_services/account.service';
import { SocieteService } from '../../_services/societe.service';
import { PaysService } from '../../_services/pays.service';
import { CommonModule } from '@angular/common';
import { LoaderService } from '../../_services/loader.service';

@Component({
  selector: 'app-projet-filter',
  imports: [ ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './projet-filter.component.html',
  styleUrl: './projet-filter.component.css'
})
export class ProjetFilterComponent implements OnInit {
  filterForm!: FormGroup;
  @Output() applyFilter = new EventEmitter<any>();

  // Chef de projet
  chefProjetOptions: any[] = [];
  filteredChefs: any[] = [];
  selectedChef: any = null;
  chefSearchTerm: string = '';
  isChefDropdownOpen: boolean = false;

  // Société
  societeOptions: any[] = [];
  filteredSocietes: any[] = [];
  selectedSociete: any = null;
  societeSearchTerm: string = '';
  isSocieteDropdownOpen: boolean = false;

  // Pays (récupéré depuis la base)
  paysOptions: any[] = [];
  filteredPays: any[] = [];
  selectedPays: any = null;
  paysSearchTerm: string = '';
  isPaysDropdownOpen: boolean = false;

  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private societeService: SocieteService,
    private paysService: PaysService,
    private loaderService: LoaderService
  ) {
    this.loaderService.isLoading$.subscribe((loading) => {
      this.isLoading = loading;
    });
  }

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      searchTerm: [''],
      chefProjet: [''],
      societe: [''],
      pays: ['']
    });

    // Chargement des données depuis la base
    this.loadChefs();
    this.loadSocietes();
    this.loadPays();
  }

  loadChefs(): void {
    // On suppose que la méthode getUsersByRole retourne les utilisateurs dont le rôle est "chef"
    this.accountService.getUsersByRole('chef de projet').subscribe((chefs: any[]) => {
      this.chefProjetOptions = chefs;
      this.filteredChefs = [...chefs];
    });
  }

  loadSocietes(): void {
    this.societeService.getSocietes().subscribe((societes: any[]) => {
      this.societeOptions = societes;
      this.filteredSocietes = [...societes];
    });
  }

  loadPays(): void {
    this.paysService.getPays().subscribe((pays: any[]) => {
      // On suppose que chaque pays est un objet avec une propriété "nom"
      this.paysOptions = pays;
      this.filteredPays = [...pays];
    });
  }

  onSubmit(): void {
    this.loaderService.showLoader();
    this.applyFilter.emit(this.filterForm.value);
    this.loaderService.hideLoader();
  }

  onReset(): void {
    this.filterForm.reset();
    this.selectedChef = null;
    this.selectedSociete = null;
    this.selectedPays = null;
    this.applyFilter.emit({});
  }

  toggleDropdown(type: 'chef' | 'societe' | 'pays', event: Event): void {
    event.stopPropagation();
    if (type === 'chef') {
      // Si le dropdown chef est ouvert, on le ferme
      if (this.isChefDropdownOpen) {
        this.isChefDropdownOpen = false;
      } else {
        // Sinon, on ferme les autres et on ouvre celui-ci
        this.closeAllDropdowns();
        this.isChefDropdownOpen = true;
        this.filteredChefs = [...this.chefProjetOptions];
        this.chefSearchTerm = '';
      }
    } else if (type === 'societe') {
      if (this.isSocieteDropdownOpen) {
        this.isSocieteDropdownOpen = false;
      } else {
        this.closeAllDropdowns();
        this.isSocieteDropdownOpen = true;
        this.filteredSocietes = [...this.societeOptions];
        this.societeSearchTerm = '';
      }
    } else if (type === 'pays') {
      if (this.isPaysDropdownOpen) {
        this.isPaysDropdownOpen = false;
      } else {
        this.closeAllDropdowns();
        this.isPaysDropdownOpen = true;
        this.filteredPays = [...this.paysOptions];
        this.paysSearchTerm = '';
      }
    }
  }
  

  filterChefs(): void {
    const term = this.chefSearchTerm.toLowerCase();
    this.filteredChefs = this.chefProjetOptions.filter(chef =>
      (chef.firstName + ' ' + chef.lastName).toLowerCase().includes(term)
    );
  }

  filterSocietes(): void {
    const term = this.societeSearchTerm.toLowerCase();
    this.filteredSocietes = this.societeOptions.filter(societe =>
      societe.nom.toLowerCase().includes(term)
    );
  }

  filterPays(): void {
    const term = this.paysSearchTerm.toLowerCase();
    this.filteredPays = this.paysOptions.filter(p =>
      p.nom.toLowerCase().includes(term)
    );
  }

  selectChef(chef: any): void {
    this.selectedChef = chef;
    this.isChefDropdownOpen = false;
    this.filterForm.patchValue({ chefProjet: chef.firstName + ' ' + chef.lastName });
  }

  selectSociete(societe: any): void {
    this.selectedSociete = societe;
    this.isSocieteDropdownOpen = false;
    this.filterForm.patchValue({ societe: societe.nom });
  }

  selectPays(pays: any): void {
    this.selectedPays = pays;
    this.isPaysDropdownOpen = false;
    this.filterForm.patchValue({ pays: pays.nom });
  }

  closeAllDropdowns(): void {
    this.isChefDropdownOpen = false;
    this.isSocieteDropdownOpen = false;
    this.isPaysDropdownOpen = false;
  }

selectItem(type: string, item: any): void {
    if (type === 'chef') {
      this.selectedChef = item;
      this.filterForm.patchValue({ chefProjet: item.firstName + ' ' + item.lastName });
    } else if (type === 'societe') {
      this.selectedSociete = item;
      this.filterForm.patchValue({ societe: item.nom });
    } else if (type === 'pays') {
      this.selectedPays = item;
      this.filterForm.patchValue({ pays: item.nom });
    }
    this.closeAllDropdowns();
  }



  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeAllDropdowns();
  }
}
