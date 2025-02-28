import { Component, OnInit } from '@angular/core';

import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginatedResult } from '../../_models/pagination';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Projet } from '../../_models/Projet';
import { ProjetService } from '../../_services/projet.service';
import { AccountService } from '../../_services/account.service';

@Component({
  selector: 'app-liste-projets',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, RouterLink],
  templateUrl: './liste-projets.component.html',
  styleUrls: ['./liste-projets.component.css']
})
export class ListeProjetsComponent implements OnInit {
  paginatedResult: PaginatedResult<Projet[]> | null = null;
  pageNumber: number = 1;
  pageSize: number = 5;
  jumpPage!: number;
  projetsSearchTerm: string = '';

  constructor(
    private projetsService: ProjetService,
    public accountService: AccountService,
    public route: ActivatedRoute) {}

  ngOnInit(): void {
    this.jumpPage = this.pageNumber;
    this.loadProjets();
  }

  onSearchChange(): void {
    // Réinitialise la pagination (page 1)
    this.pageNumber = 1;
    this.loadProjets();
  }
  
  loadProjets(): void {
    const currentUser = this.accountService.currentUser();
    
    // Vérifie si l'utilisateur connecté est un super admin (en comparaison en minuscules)
    if (currentUser && currentUser.role?.toLowerCase() === 'super admin') {
      // Super admin : affiche tous les projets
      this.projetsService.getPaginatedProjets(this.pageNumber, this.pageSize, this.projetsSearchTerm)
        .subscribe({
          next: (result) => {
            this.paginatedResult = result;
          },
          error: (error) => {
            console.error('Erreur lors du chargement des projets paginés', error);
          }
        });
    } else if (currentUser) {
      
      // Autres utilisateurs : affiche uniquement les projets qui leur sont associés
      this.accountService.getUserProjects(currentUser.id, this.pageNumber, this.pageSize, this.projetsSearchTerm)
        .subscribe({
          next: (result) => {
            this.paginatedResult = result;
          },
          error: (error) => {
            console.error('Erreur lors de la requête vers :', error.url || 'URL inconnue', error);
            console.error('Erreur lors du chargement des projets de l\'utilisateur', error);
          }
        });
    } else {
      console.error("Utilisateur non connecté");
    }
  }
  

  // Getter qui applique le filtre sur la liste des projets de la page actuelle
  get filteredProjets(): Projet[] {
    const projets = this.paginatedResult?.items || [];
    if (!this.projetsSearchTerm.trim()) {
      return projets;
    }
    const lowerTerm = this.projetsSearchTerm.toLowerCase();
    return projets.filter(projet => 
      projet.nom.toLowerCase().includes(lowerTerm)
    );
  }

  // Gestion de la pagination
  onPageChange(newPage: number): void {
    const maxPage = this.paginatedResult?.pagination?.totalPages || 1;
    this.pageNumber = Math.min(Math.max(newPage, 1), maxPage);
    this.jumpPage = this.pageNumber;
    this.loadProjets();
  }

  jumpToPage(): void {
    const totalPages = this.paginatedResult?.pagination?.totalPages || 1;
    const page = Number(this.jumpPage);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      this.onPageChange(page);
    } else {
      console.warn('Numéro de page invalide');
    }
  }

  deleteProjet(id: number): void {
    this.projetsService.deleteProjet(id).subscribe(() => {
      this.loadProjets();
    });
  }

  selectAll(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    if (this.paginatedResult?.items) {
      this.paginatedResult.items.forEach(projet => projet.selected = checkbox.checked);
    }
  }
  

  toggleSelection(projet: Projet, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    projet.selected = checkbox.checked;
  }
  

  range(start: number, end: number): number[] {
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  deleteSelectedProjects(): void {
    const projets = this.paginatedResult?.items || [];
    const selectedIds = projets
      .filter(projet => projet.selected)
      .map(projet => projet.id);
  
    if (selectedIds.length === 0) {
      console.warn("Aucun projet sélectionné pour suppression.");
      return;
    }
  
    if (confirm("Êtes-vous sûr de vouloir supprimer les projets sélectionnés ?")) {
      this.projetsService.deleteSelectedProjets(selectedIds).subscribe({
        next: () => {
          this.loadProjets();
        },
        error: error => console.error("Erreur lors de la suppression", error)
      });
    }
  }
  
}
