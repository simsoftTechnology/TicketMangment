import { Component, OnInit } from '@angular/core';
import { SocieteService } from '../../_services/societe.service';
import { Societe } from '../../_models/societe';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginatedResult } from '../../_models/pagination';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-liste-societes',
  standalone: true,
  imports: [ NgFor, FormsModule, RouterLink ],
  templateUrl: './liste-societes.component.html',
  styleUrl: './liste-societes.component.css'
})
export class ListeSocietesComponent implements OnInit {
  societes: Societe[] = [];
  // Variables pour la pagination
  pageNumber: number = 1;
  pageSize: number = 5;
  paginatedResult: PaginatedResult<Societe[]> | null = null;
  jumpPage!: number;

  constructor(private societeService: SocieteService) {}

  ngOnInit(): void {
    this.jumpPage = this.pageNumber;
    this.loadSocietes();
  }

  loadSocietes(): void {
    this.societeService.getPaginatedSocietes(this.pageNumber, this.pageSize).subscribe({
      next: (result) => {
        this.paginatedResult = result;
        // Si result.items est undefined, on utilise un tableau vide []
        this.societes = result.items || [];
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
    this.loadSocietes();
  }

  // Méthode pour recharger les données en fonction de la page actuelle
  loadPage(): void {
    this.loadSocietes();
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

  deleteSociete(id: number): void {
    this.societeService.deleteSociete(id).subscribe(() => {
      this.loadSocietes();
    });
  }

   // Méthode optionnelle pour la gestion de la sélection via la checkbox "select all"
   selectAll(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.societes = this.societes.map(societe => ({
      ...societe,
      selected: checkbox.checked
    }));
  }

  // Méthode optionnelle pour gérer la sélection d'un élément
  toggleSelection(societe: Societe): void {
    societe.selected = !societe.selected;
    // Vous pouvez ajouter ici une logique supplémentaire si besoin (ex: mettre à jour le select all)
  }

  range(start: number, end: number): number[] {
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }
}
