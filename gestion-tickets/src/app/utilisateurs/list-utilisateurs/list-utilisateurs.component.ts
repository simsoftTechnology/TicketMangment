import { Component, OnInit, inject } from '@angular/core';
import { AccountService } from '../../_services/account.service';
import { CommonModule, NgClass, NgFor, NgIf } from '@angular/common';
import { User } from '../../_models/user';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { PaginatedResult } from '../../_models/pagination';
import { ToastrService } from 'ngx-toastr';
import { ConfirmModalComponent } from '../../confirm-modal/confirm-modal.component';
import { OverlayModalService } from '../../_services/overlay-modal.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { UserFilterComponent } from '../../_filters/user-filter/user-filter.component';

@Component({
    selector: 'app-list-utilisateurs',
    imports: [NgFor, NgIf, NgClass, FormsModule, RouterLink, CommonModule,
      MatMenuModule,
    MatIconModule,
    MatButtonModule,
    UserFilterComponent
    ],
    templateUrl: './list-utilisateurs.component.html',
    styleUrls: ['./list-utilisateurs.component.css']
})
export class ListUtilisateursComponent implements OnInit {
  public accountService = inject(AccountService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private overlayModalService = inject(OverlayModalService);

  // Variables de pagination et recherche
  pageNumber: number = 1;
  pageSize: number = 9;
  paginatedResult: PaginatedResult<User[]> | null = null;
  jumpPage: number = 1;
  usersSearchTerm: string = '';

  // Paramètres de filtrage supplémentaires (rôle, actif, contrat)
  filterParams: any = {};

  newUserId: number | null = null;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const newUser = params['newUser'];
      if (newUser) {
        this.newUserId = +newUser;
        this.getUsers();
        this.router.navigate([], {
          queryParams: { newUser: null },
          queryParamsHandling: 'merge',
          replaceUrl: true
        });
        setTimeout(() => { this.newUserId = null; }, 2000);
      } else {
        this.getUsers();
      }
    });
    this.setCurrentUser();
  }

  setCurrentUser(): void {
    const userString = localStorage.getItem('user');
    if (!userString) return;
    const user = JSON.parse(userString);
    this.accountService.currentUser.set(user);
  }

  getUsers(): void {
    // Combinez la recherche globale et les filtres avancés
    const searchTerm = this.usersSearchTerm || '';
    this.accountService.getUsers(this.pageNumber, this.pageSize, searchTerm, this.filterParams)
      .subscribe({
        next: (response) => {
          const updatedItems = (response.items ?? []).map(user => {
            if (user.contrat) {
              user.contrat.dateDebut = new Date(user.contrat.dateDebut);
              if (user.contrat.dateFin) {
                user.contrat.dateFin = new Date(user.contrat.dateFin);
              }
            }
            return { ...user, selected: false };
          });
          const result: PaginatedResult<User[]> = {
            items: updatedItems,
            pagination: response.pagination
          };
          this.accountService.paginatedResult.set(result);
          this.paginatedResult = result;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des utilisateurs paginés', error);
        }
      });
  }

  // Méthode appelée depuis le composant de filtre
  onFilter(filterValues: any): void {
    this.filterParams = filterValues;
    this.pageNumber = 1;
    this.getUsers();
  }

  onSearchChange(): void {
    this.pageNumber = 1;
    this.getUsers();
  }

  onPageChange(newPage: number): void {
    const maxPage = this.accountService.paginatedResult()?.pagination?.totalPages || 1;
    this.pageNumber = Math.min(Math.max(newPage, 1), maxPage);
    this.jumpPage = this.pageNumber;
    this.getUsers();
  }

  jumpToPage(): void {
    const totalPages = this.paginatedResult?.pagination?.totalPages || 1;
    this.jumpPage = Math.min(Math.max(Number(this.jumpPage), 1), totalPages);
    this.onPageChange(this.jumpPage);
  }

  selectAll(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const currentItems = this.accountService.paginatedResult()?.items || [];
    currentItems.forEach(user => user.selected = checkbox.checked);
    this.accountService.paginatedResult.set({
      ...this.accountService.paginatedResult(),
      items: currentItems
    });
  }

  toggleSelection(user: User): void {
    user.selected = !user.selected;
    const currentItems = this.accountService.paginatedResult()?.items || [];
    const allSelected = currentItems.every(u => u.selected);
    const selectAllCheckbox = document.getElementById('selectAll') as HTMLInputElement;
    if (selectAllCheckbox) {
      selectAllCheckbox.checked = allSelected;
    }
    this.accountService.paginatedResult.set({
      ...this.accountService.paginatedResult(),
      items: currentItems
    });
  }

  getRoleClass(role: string): string {
    switch (role.toLowerCase()) {
      case 'super admin': return 'super-admin';
      case 'chef de projet': return 'chef-de-projet';
      case 'développeur': return 'developpeur';
      case 'client': return 'client';
      default: return '';
    }
  }

  range(start: number, end: number): number[] {
    return Array(end - start + 1).fill(0).map((_, i) => start + i);
  }

  deleteUser(user: User): void {
    const modalInstance = this.overlayModalService.open(ConfirmModalComponent);
    modalInstance.message = `Voulez-vous vraiment supprimer l'utilisateur ${user.firstName} ${user.lastName} ?`;
  
    modalInstance.confirmed.subscribe(() => {
      this.accountService.deleteUser(user.id).subscribe({
        next: () => {
          this.toastr.success('Utilisateur supprimé avec succès.');
          this.getUsers();
        },
        error: error => {
          console.error("Erreur lors de la suppression de l'utilisateur", error);
        }
      });
      this.overlayModalService.close();
    });
  
    modalInstance.cancelled.subscribe(() => {
      this.overlayModalService.close();
    });
  }

  exportUsers(): void {
    // Vous pouvez transmettre les filtres en cours via this.filterParams et this.usersSearchTerm
    const searchTerm = this.usersSearchTerm || '';
    // Ici, on suppose que votre AccountService.getUsers() accepte les filtres pour l'export
    this.accountService.exportUsers(searchTerm, this.filterParams)
      .subscribe({
        next: (blob: Blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `UsersExport_${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}.xlsx`;
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error: error => {
          console.error("Erreur lors de l'export Excel des utilisateurs", error);
        }
      });
  }
  
}

