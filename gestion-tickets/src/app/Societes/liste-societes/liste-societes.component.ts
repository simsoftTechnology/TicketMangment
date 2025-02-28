import { Component, OnInit } from '@angular/core';
import { SocieteService } from '../../_services/societe.service';
import { Societe } from '../../_models/societe';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginatedResult } from '../../_models/pagination';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs'; // Import de forkJoin

@Component({
    selector: 'app-liste-societes',
    imports: [NgFor, FormsModule, RouterLink, NgIf],
    templateUrl: './liste-societes.component.html',
    styleUrls: ['./liste-societes.component.css']
})
export class ListeSocietesComponent implements OnInit {
  societes: Societe[] = [];
  // Variables pour la pagination
  pageNumber: number = 1;
  pageSize: number = 5;
  paginatedResult: PaginatedResult<Societe[]> | null = null;
  jumpPage!: number;
  // Terme de recherche (sera transmis au service)
  societesSearchTerm: string = '';

  constructor(private societeService: SocieteService,
    public route: ActivatedRoute) {}

  ngOnInit(): void {
    this.jumpPage = this.pageNumber;
    this.loadSocietes();
  }

  // Lorsqu'on change le terme de recherche, on revient à la première page et on recharge
  onSearchChange(): void {
    this.pageNumber = 1;
    this.loadSocietes();
  }

  loadSocietes(): void {
    this.societeService
      .getPaginatedSocietes(this.pageNumber, this.pageSize, this.societesSearchTerm)
      .subscribe({
        next: (result) => {
          this.paginatedResult = result;
          // Utiliser directement le tableau retourné par l'API
          this.societes = result.items || [];
        },
        error: (error) => {
          console.error('Erreur lors du chargement des sociétés paginées', error);
        }
      });
  }

  // Pour la pagination, on travaille toujours avec l'API
  onPageChange(newPage: number): void {
    const maxPage = this.paginatedResult?.pagination?.totalPages || 1;
    this.pageNumber = Math.min(Math.max(newPage, 1), maxPage);
    this.jumpPage = this.pageNumber;
    this.loadSocietes();
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

  deleteSociete(id: number): void {
    this.societeService.deleteSociete(id).subscribe(() => {
      this.loadSocietes();
    });
  }

  selectAll(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.societes = this.societes.map(societe => ({
      ...societe,
      selected: checkbox.checked
    }));
  }

  toggleSelection(societe: Societe): void {
    societe.selected = !societe.selected;
  }

  /**
   * Méthode pour supprimer en masse les sociétés sélectionnées.
   */
  deleteSelectedSocietes(): void {
    // Filtrer les sociétés marquées comme sélectionnées
    const selectedSocietes = this.societes.filter(societe => societe.selected);
    if (selectedSocietes.length === 0) {
      alert("Aucune société sélectionnée.");
      return;
    }

    if (confirm("Êtes-vous sûr de vouloir supprimer les sociétés sélectionnées ?")) {
      // Si vous souhaitez envoyer une requête unique au backend pour la suppression en masse :
      const selectedIds = selectedSocietes.map(s => s.id);
      this.societeService.deleteSelectedSocietes(selectedIds).subscribe({
        next: () => {
          alert("Les sociétés sélectionnées ont été supprimées avec succès.");
          this.loadSocietes();
        },
        error: (error) => {
          console.error("Erreur lors de la suppression des sociétés", error);
          alert("Une erreur est survenue lors de la suppression.");
        }
      });
    }
  }

  range(start: number, end: number): number[] {
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }
}
