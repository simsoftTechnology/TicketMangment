import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-filter',
  imports: [ CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './user-filter.component.html',
  styleUrl: './user-filter.component.css'
})
export class UserFilterComponent implements OnInit {
  filterForm!: FormGroup;
  @Output() applyFilter = new EventEmitter<any>();

  // Dropdown pour le rôle
  roleOptions: string[] = ['Tous', 'Super Admin', 'Chef de Projet', 'Développeur', 'Client'];
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

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      searchTerm: [''],
      role: ['Tous'],
      actif: ['Tous'],
      hasContract: ['Tous']
    });

    // Initialisation des listes affichées
    this.filteredRoles = [...this.roleOptions];
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
    this.applyFilter.emit(filterValues);
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