import { Component, OnInit } from '@angular/core';
import { CategorieProbleme } from '../../_models/categorie-probleme.model';
import { PaginatedResult } from '../../_models/pagination';
import { CategorieProblemeService } from '../../_services/categorie-probleme.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CategorieModalComponent } from '../categorie-modal/categorie-modal.component';
import { OverlayModalService } from '../../_services/overlay-modal.service';
import { ToastrService } from 'ngx-toastr';
import { ConfirmModalComponent } from '../../confirm-modal/confirm-modal.component';

@Component({
    selector: 'app-categories',
    imports: [FormsModule, CommonModule],
    templateUrl: './categories.component.html',
    styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {
  categories: CategorieProbleme[] = [];
  searchTerm: string = '';

  // Pagination
  pageNumber: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;
  paginatedResult: PaginatedResult<CategorieProbleme[]> | null = null;

  showAddModal: boolean = false;

  constructor(private categorieService: CategorieProblemeService,
    private overlayModalService: OverlayModalService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadCategories();
  }

  // Chargement paginé des catégories selon le terme de recherche
  loadCategories(): void {
    this.categorieService.getCategoriesPaginated(this.pageNumber, this.pageSize, this.searchTerm)
      .subscribe({
        next: (response) => {
          this.paginatedResult = response;
          this.categories = response.items || [];
          if (response.pagination) {
            this.totalItems = response.pagination.totalItems;
            this.totalPages = response.pagination.totalPages;
          }
        },
        error: (err) => console.error('Erreur lors du chargement des catégories :', err)
      });
  }

  // Actualisation lors du changement du terme de recherche
  onSearchChange(): void {
    this.pageNumber = 1;
    this.loadCategories();
  }

  // Gestion de la pagination
  onPageChange(newPage: number): void {
    if (newPage < 1 || newPage > this.totalPages) {
      return;
    }
    this.pageNumber = newPage;
    this.loadCategories();
  }

  // Sélectionner ou désélectionner toutes les catégories affichées
  selectAll(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.categories.forEach(categorie => categorie.selected = checkbox.checked);
  }

  // Suppression d'une catégorie individuellement
  deleteCategorie(id: number): void {
    const modalInstance = this.overlayModalService.open(ConfirmModalComponent);
    modalInstance.message = "Êtes-vous sûr de vouloir supprimer cette catégorie ?";
    
    modalInstance.confirmed.subscribe(() => {
      this.categorieService.deleteCategory(id).subscribe({
        next: () =>{ this.toastr.success("Catégorie suprimée avec succèss"),
                  this.loadCategories()},
        error: (err) => console.error("Erreur lors de la suppression de la catégorie :", err)
      });
      this.overlayModalService.close();
    });
    
    modalInstance.cancelled.subscribe(() => {
      this.overlayModalService.close();
    });
  }
  

  // Suppression en masse des catégories sélectionnées
  deleteSelectedCategories(): void {
    const selectedCategories = this.categories.filter(categorie => categorie.selected);
    if (selectedCategories.length === 0) {
      this.toastr.warning("Aucune catégorie sélectionnée.");
      return;
    }
  
    const modalInstance = this.overlayModalService.open(ConfirmModalComponent);
    modalInstance.message = "Êtes-vous sûr de vouloir supprimer les catégories sélectionnées ?";
    
    modalInstance.confirmed.subscribe(() => {
      const selectedIds = selectedCategories.map(categorie => categorie.id);
      this.categorieService.deleteSelectedCategories(selectedIds).subscribe({
        next: () => {
          this.toastr.success("Les catégories sélectionnées ont été supprimées.");
          this.loadCategories();
        },
        error: (error) => {
          console.error("Erreur lors de la suppression des catégories sélectionnées", error);
          this.toastr.error("Une erreur est survenue lors de la suppression.");
        }
      });
      this.overlayModalService.close();
    });
    
    modalInstance.cancelled.subscribe(() => {
      this.overlayModalService.close();
    });
  }
  

  // Méthode utilitaire pour générer une plage de nombres (pour le per-page-selector)
  range(start: number, end: number): number[] {
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  openCategorieModal(): void {
    // Ouvre la modal et récupère l'instance du composant modal
    const modalInstance = this.overlayModalService.open(CategorieModalComponent);

    // Souscription à l'événement categoryAdded pour récupérer le nom de la catégorie
    modalInstance.categoryAdded.subscribe((nom: string) => {
      // Création d'un objet catégorie. Ici, id peut être mis à 0 ou ignoré, selon votre implémentation back-end
      const nouvelleCategorie: CategorieProbleme = { id: 0, nom: nom };

      // Appel du service pour ajouter la catégorie
      this.categorieService.addCategory(nouvelleCategorie).subscribe({
        next: (categorie) => {
          this.toastr.success('Catégorie ajoutée avec succès.');
          // Fermeture du modal
          this.overlayModalService.close();
          // Recharge la liste des catégories pour afficher la nouvelle
          this.loadCategories();
        },
        error: (error) => {
          console.error('Erreur ajout catégorie', error);
          let errMsg = "Erreur lors de l'ajout de la catégorie.";
          if (Array.isArray(error)) {
            errMsg = error.join(' ');
          } else if (typeof error === 'string') {
            errMsg = error;
          } else if (error.error) {
            if (Array.isArray(error.error)) {
              errMsg = error.error.join(' ');
            } else if (typeof error.error === 'string') {
              errMsg = error.error;
            } else if (typeof error.error === 'object') {
              errMsg = error.error.message || JSON.stringify(error.error);
            }
          } else if (error.message) {
            errMsg = error.message;
          }
          this.toastr.error(errMsg);
        }
      });
    });

    // Gestion de la fermeture manuelle du modal (si l'utilisateur clique sur Annuler par exemple)
    modalInstance.close.subscribe(() => {
      this.overlayModalService.close();
    });
  }


  // Passe la catégorie en mode édition et sauvegarde l'état initial pour pouvoir annuler
  editCategorie(categorie: CategorieProbleme): void {
    // Ajoute une propriété temporaire pour conserver le nom d'origine
    categorie.originalName = categorie.nom;
    categorie.editing = true;
  }

  // Enregistre les modifications en appelant le service de mise à jour
  saveEdit(categorie: CategorieProbleme): void {
    this.categorieService.updateCategory(categorie).subscribe({
      next: () => {
        this.toastr.success("Catégorie modifiée avec succès.");
        categorie.editing = false;
      },
      error: (err) => {
        console.error("Erreur lors de la mise à jour de la catégorie :", err);
        this.toastr.error("Une erreur est survenue lors de la modification de la catégorie.");
      }
    });
  }

  // Annule l'édition et restaure le nom original
  cancelEdit(categorie: CategorieProbleme): void {
    const cat = categorie as any;
    if (cat.originalName !== undefined) {
      categorie.nom = cat.originalName;
    }
    cat.editing = false;
  }
  
  exportCategories(): void {
    this.categorieService.exportCategories().subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `CategoriesExport_${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error("Erreur lors de l'export Excel des catégories", error);
      }
    });
  }

}
