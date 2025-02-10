import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SocieteService } from '../../_services/societe.service';
import { Societe } from '../../_models/societe';
import { NgFor, NgIf } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { DropdownService } from '../../_services/dropdown.service'; // Pour une utilisation éventuelle dans le filtrage

@Component({
  selector: 'app-modifier-societe',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor, FormsModule],
  templateUrl: './modifier-societe.component.html',
  styleUrls: ['./modifier-societe.component.css']
})
export class ModifierSocieteComponent implements OnInit {
  societeForm!: FormGroup;
  societeId!: number;
  societeDetails: Societe = {
    id: 0,
    nom: '',
    adresse: '',
    telephone: '',
    utilisateurs: [],
    projets: []
  };

  activeTab: string = 'utilisateurs';

  // PROPRIÉTÉS DE PAGINATION POUR LES PROJETS
  pageNumber: number = 1;
  pageSize: number = 1;
  jumpPage!: number;

  // PROPRIÉTÉS DE PAGINATION POUR LES UTILISATEURS
  userPageNumber: number = 1;
  userPageSize: number = 5;
  userJumpPage: number = 1;

  // Termes de recherche pour filtrer
  projectSearchTerm: string = '';
  userSearchTerm: string = '';

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private societeService: SocieteService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.societeId = +this.route.snapshot.paramMap.get('id')!;

    this.societeForm = this.fb.group({
      nom: ['', Validators.required],
      adresse: ['', Validators.required],
      telephone: ['', [
        Validators.required,
        Validators.pattern('^\\+?[0-9\\-\\s]+$')
      ]]
    });

    this.societeService.getSocieteDetails(this.societeId).subscribe(
      (details: Societe) => {
        this.societeDetails = details;
        this.societeForm.patchValue({
          nom: details.nom,
          adresse: details.adresse,
          telephone: details.telephone
        });
        // Initialiser les numéros de page
        this.jumpPage = this.pageNumber;
        this.userJumpPage = this.userPageNumber;
      },
      error => {
        console.error('Erreur lors de la récupération des détails', error);
      }
    );
  }

  onSubmit(): void {
    if (!this.societeForm.dirty) {
      this.toastr.warning("Veuillez modifier au moins un champ.");
      return;
    }

    if (this.societeForm.valid) {
      const updatedSociete: Societe = {
        ...this.societeDetails,
        ...this.societeForm.value
      };

      this.societeService.updateSociete(this.societeId, updatedSociete).subscribe({
        next: () => {
          this.toastr.success("Modifié avec succès");
        },
        error: error => {
          console.error('Erreur lors de la mise à jour de la société', error);
          this.toastr.error("Erreur lors de la mise à jour");
        }
      });
    } else {
      console.error("Formulaire invalide", this.societeForm.errors);
      Object.keys(this.societeForm.controls).forEach(key => {
        const controlErrors = this.societeForm.get(key)?.errors;
        if (controlErrors) {
          console.error(`Erreur sur le champ ${key}:`, controlErrors);
        }
      });
    }
  }

  // Méthode appelée par le bouton Annuler pour réinitialiser le formulaire
  onCancel(): void {
    this.societeForm.patchValue({
      nom: this.societeDetails.nom,
      adresse: this.societeDetails.adresse,
      telephone: this.societeDetails.telephone,

    });
    this.societeForm.markAsPristine();
  }

  switchTab(tab: string): void {
    this.activeTab = tab;
  }

  // Méthode générique pour paginer une liste
  private paginate<T>(items: T[], page: number, pageSize: number): T[] {
    const startIndex = (page - 1) * pageSize;
    return items.slice(startIndex, startIndex + pageSize);
  }

  // ===============================
  // FILTRAGE ET PAGINATION DES PROJETS
  // ===============================
  get filteredProjects(): any[] {
    if (!this.projectSearchTerm.trim()) {
      return this.societeDetails.projets;
    }
    return this.societeDetails.projets.filter(projet =>
      projet.nom.toLowerCase().includes(this.projectSearchTerm.toLowerCase()) ||
      (projet.description && projet.description.toLowerCase().includes(this.projectSearchTerm.toLowerCase()))
    );
  }

  get displayedProjects(): any[] {
    return this.paginate(this.filteredProjects, this.pageNumber, this.pageSize);
  }

  get totalPages(): number {
    return this.filteredProjects.length > 0
      ? Math.ceil(this.filteredProjects.length / this.pageSize)
      : 1;
  }

  onPageChange(newPage: number): void {
    this.pageNumber = Math.min(Math.max(newPage, 1), this.totalPages);
    this.jumpPage = this.pageNumber;
  }

  jumpToPage(): void {
    const page = Number(this.jumpPage);
    if (!isNaN(page) && page >= 1 && page <= this.totalPages) {
      this.onPageChange(page);
    } else {
      console.warn('Numéro de page invalide');
    }
  }

  // ===============================
  // FILTRAGE ET PAGINATION DES UTILISATEURS
  // ===============================
  get filteredUsers(): any[] {
    if (!this.userSearchTerm.trim()) {
      return this.societeDetails.utilisateurs;
    }
    return this.societeDetails.utilisateurs.filter(user =>
      (`${user.firstName} ${user.lastName}`.toLowerCase().includes(this.userSearchTerm.toLowerCase()) ||
       user.email.toLowerCase().includes(this.userSearchTerm.toLowerCase()) ||
       (user.role && user.role.toLowerCase().includes(this.userSearchTerm.toLowerCase()))
      )
    );
  }

  get displayedUsers(): any[] {
    return this.paginate(this.filteredUsers, this.userPageNumber, this.userPageSize);
  }

  get userTotalPages(): number {
    return this.filteredUsers.length > 0
      ? Math.ceil(this.filteredUsers.length / this.userPageSize)
      : 1;
  }

  onUserPageChange(newPage: number): void {
    this.userPageNumber = Math.min(Math.max(newPage, 1), this.userTotalPages);
    this.userJumpPage = this.userPageNumber;
  }

  jumpToUserPage(): void {
    const page = Number(this.userJumpPage);
    if (!isNaN(page) && page >= 1 && page <= this.userTotalPages) {
      this.onUserPageChange(page);
    } else {
      console.warn('Numéro de page utilisateur invalide');
    }
  }

  // Exemple de méthode pour visualiser un projet
  viewProjet(projetId: number): void {
    this.router.navigate(['/projets/details', projetId]);
  }

  // Génère une plage de nombres pour le sélecteur d'éléments par page
  range(start: number, end: number): number[] {
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }
}
