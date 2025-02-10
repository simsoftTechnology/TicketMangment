import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProjetService } from '../../_services/projet.service';
import { PaginatedResult } from '../../_models/pagination';
import { Projet } from '../../_models/Projet';

@Component({
  selector: 'app-liste-projets',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './liste-projets.component.html',
  styleUrls: ['./liste-projets.component.css']
})
export class ListeProjetsComponent implements OnInit {
  projetService = inject(ProjetService);

  // Variables pour la pagination
  pageNumber: number = 1;
  pageSize: number = 5;
  paginatedResult: PaginatedResult<Projet[]> | null = null;
  jumpPage!: number;


  ngOnInit(): void {
    this.jumpPage = this.pageNumber;
    this.loadProjets();
  }

  // Charger les projets paginés
  loadProjets(): void {
    this.projetService.getPaginatedProjets(this.pageNumber, this.pageSize).subscribe({
      next: (result) => {
        this.paginatedResult = result;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des projets paginés', error);
      }
    });
  }

  // Changer de page
  onPageChange(newPage: number): void {
    const maxPage = this.paginatedResult?.pagination?.totalPages || 1;
    this.pageNumber = Math.min(Math.max(newPage, 1), maxPage);
    this.jumpPage = this.pageNumber;
    this.loadProjets();
  }

  // Méthode pour recharger les données en fonction de la page actuelle
  loadPage(): void {
    this.loadProjets();
  }

  // Retourner la liste complète des numéros de page (non utilisé ici)
  getPages(): number[] {
    const totalPages = this.paginatedResult?.pagination?.totalPages || 0;
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  

  // Saut direct vers une page donnée
  jumpToPage(): void {
    const totalPages = this.paginatedResult?.pagination?.totalPages || 1;
    const page = Number(this.jumpPage); // s'assurer qu'on travaille avec un nombre
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      this.onPageChange(page);
    } else {
      console.warn('Numéro de page invalide');
    }
  }
  

  // Sélectionner/désélectionner tous les projets de la page
  selectAll(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    if (this.paginatedResult) {
      this.paginatedResult?.items?.forEach(projet => projet.selected = checkbox.checked);
    }
  }

  // Bascule la sélection d'un projet
  toggleSelection(projet: Projet): void {
    projet.selected = !projet.selected;
    if (this.paginatedResult?.items) {
      const allSelected = this.paginatedResult.items.every(u => u.selected);
      const selectAllCheckbox = document.getElementById('selectAll') as HTMLInputElement;
      if (selectAllCheckbox) {
        selectAllCheckbox.checked = allSelected;
      }
    }
  }

  // Supprimer un projet
  deleteProjet(id: number): void {
    this.projetService.deleteProjet(id).subscribe({
      next: () => {
        this.loadProjets();
      },
      error: (error) => {
        console.error('Erreur lors de la suppression du projet', error);
      }
    });
  }

  // Générer une plage de nombres (pour le sélecteur d'éléments par page)
  range(start: number, end: number): number[] {
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }
}
