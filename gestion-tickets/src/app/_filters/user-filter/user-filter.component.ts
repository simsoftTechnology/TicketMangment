import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoaderService } from '../../_services/loader.service';
import { RoleService } from '../../_services/role.service';
import { Role } from '../../_models/role.model';

@Component({
  selector: 'app-user-filter',
  imports: [ CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './user-filter.component.html',
  styleUrls: ['./user-filter.component.css']  // Assurez-vous que le nom du fichier est bien styleUrls (avec un "s")
})
export class UserFilterComponent implements OnInit {
  filterForm!: FormGroup;
  @Output() applyFilter = new EventEmitter<any>();

  // Dropdown pour le rôle (sera mis à jour via l'API)
  roleOptions: string[] = [];  // On va récupérer les rôles depuis l'API
  filteredRoles: string[] = [];
  selectedRole: string = 'Tous';
  roleSearchTerm: string = '';
  isRoleDropdownOpen: boolean = false;

  // Dropdown pour l'état Actif
  actifOptions: string[] = ['Tous', 'Oui', 'Non'];
  filteredActifs: string[] = [];
  selectedActif: string = 'Tous';
  actifSearchTerm: string = '';
  isActifDropdownOpen: boolean = false;

  // Dropdown pour le Contrat
  contractOptions: string[] = ['Tous', 'Avec contrat', 'Sans contrat'];
  filteredContracts: string[] = [];
  selectedContract: string = 'Tous';
  contractSearchTerm: string = '';
  isContractDropdownOpen: boolean = false;

  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private loaderService: LoaderService,
    private roleService: RoleService  // Injection du service des rôles
  ) {
    this.loaderService.isLoading$.subscribe((loading) => {
      this.isLoading = loading;
    });
  }

  ngOnInit(): void {
    // Initialisation du formulaire de filtre
    this.filterForm = this.fb.group({
      searchTerm: [''],
      role: ['Tous'],
      actif: ['Tous'],
      hasContract: ['Tous']
    });

    // Récupérer les rôles depuis l'API
    this.roleService.getRoles().subscribe({
      next: (roles: Role[]) => {
        // On ajoute "Tous" en première position pour permettre l'absence de filtre
        this.roleOptions = ['Tous', ...roles.map(r => r.name)];
        // Initialisation de la liste filtrée
        this.filteredRoles = [...this.roleOptions];
      },
      error: (err) => console.error('Erreur lors de la récupération des rôles', err)
    });

    // Initialisation des listes statiques pour les autres dropdowns
    this.filteredActifs = [...this.actifOptions];
    this.filteredContracts = [...this.contractOptions];
  }

  onSubmit(): void {
    // Transformation des valeurs 'Tous' en null pour ne pas appliquer de filtre
    const filterValues = this.filterForm.value;
    filterValues.role = filterValues.role === 'Tous' ? null : filterValues.role;
    filterValues.actif = filterValues.actif === 'Tous' ? null : (filterValues.actif === 'Oui');
    if (filterValues.hasContract === 'Tous') {
      filterValues.hasContract = null;
    } else if (filterValues.hasContract === 'Avec contrat') {
      filterValues.hasContract = true;
    } else if (filterValues.hasContract === 'Sans contrat') {
      filterValues.hasContract = false;
    }
    this.loaderService.showLoader();
    this.applyFilter.emit(filterValues);
    this.loaderService.hideLoader();
  }

  onReset(): void {
    this.filterForm.reset({
      searchTerm: '',
      role: 'Tous',
      actif: 'Tous',
      hasContract: 'Tous'
    });
    this.selectedRole = 'Tous';
    this.selectedActif = 'Tous';
    this.selectedContract = 'Tous';
    this.applyFilter.emit({});
  }

  toggleDropdown(type: 'role' | 'actif' | 'contract', event: Event): void {
    event.stopPropagation();
    if (type === 'role') {
      this.isRoleDropdownOpen = !this.isRoleDropdownOpen;
      if (this.isRoleDropdownOpen) {
        this.filteredRoles = [...this.roleOptions];
        this.roleSearchTerm = '';
      }
      this.isActifDropdownOpen = false;
      this.isContractDropdownOpen = false;
    } else if (type === 'actif') {
      this.isActifDropdownOpen = !this.isActifDropdownOpen;
      if (this.isActifDropdownOpen) {
        this.filteredActifs = [...this.actifOptions];
        this.actifSearchTerm = '';
      }
      this.isRoleDropdownOpen = false;
      this.isContractDropdownOpen = false;
    } else if (type === 'contract') {
      this.isContractDropdownOpen = !this.isContractDropdownOpen;
      if (this.isContractDropdownOpen) {
        this.filteredContracts = [...this.contractOptions];
        this.contractSearchTerm = '';
      }
      this.isRoleDropdownOpen = false;
      this.isActifDropdownOpen = false;
    }
  }

  filterRoles(): void {
    const term = this.roleSearchTerm.toLowerCase();
    this.filteredRoles = this.roleOptions.filter(r => r.toLowerCase().includes(term));
  }

  filterActifs(): void {
    const term = this.actifSearchTerm.toLowerCase();
    this.filteredActifs = this.actifOptions.filter(a => a.toLowerCase().includes(term));
  }

  filterContracts(): void {
    const term = this.contractSearchTerm.toLowerCase();
    this.filteredContracts = this.contractOptions.filter(c => c.toLowerCase().includes(term));
  }

  selectItem(type: 'role' | 'actif' | 'contract', item: string): void {
    if (type === 'role') {
      this.selectedRole = item;
      this.filterForm.patchValue({ role: item });
      this.isRoleDropdownOpen = false;
    } else if (type === 'actif') {
      this.selectedActif = item;
      this.filterForm.patchValue({ actif: item });
      this.isActifDropdownOpen = false;
    } else if (type === 'contract') {
      this.selectedContract = item;
      this.filterForm.patchValue({ hasContract: item });
      this.isContractDropdownOpen = false;
    }
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.isRoleDropdownOpen = false;
    this.isActifDropdownOpen = false;
    this.isContractDropdownOpen = false;
  }
}
