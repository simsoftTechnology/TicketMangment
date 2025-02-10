import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { AccountService } from '../../_services/account.service';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { User } from '../../_models/user';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PaginatedResult } from '../../_models/pagination';

@Component({
  selector: 'app-list-utilisateurs',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, FormsModule, RouterLink],
  templateUrl: './list-utilisateurs.component.html',
  styleUrls: ['./list-utilisateurs.component.css']
})
export class ListUtilisateursComponent implements OnInit {
  public accountService = inject(AccountService);

  // Variables pour la pagination
  pageNumber: number = 1;
  pageSize: number = 9;
  paginatedResult: PaginatedResult<User[]> | null = null;
  jumpPage: number = 1;

  ngOnInit(): void {
    // Charge les utilisateurs si le signal est vide
    if (!this.accountService.paginatedResult()) {
      this.getUsers();
    }
    this.setCurrentUser();
  }

  setCurrentUser() {
    const userString = localStorage.getItem('user');
    if (!userString) return;
    const user = JSON.parse(userString);
    this.accountService.currentUser.set(user);
  }

  // Appel du service pour charger la page demandée
  getUsers(): void {
    this.accountService.getUsers(this.pageNumber, this.pageSize).subscribe({
      next: (response) => {
        const updatedItems = (response.items ?? []).map(user => ({ ...user, selected: false }));
        const result: PaginatedResult<User[]> = {
          items: updatedItems,
          pagination: response.pagination
        };
        // Met à jour le signal
        this.accountService.paginatedResult.set(result);
        // Met à jour la variable locale
        this.paginatedResult = result;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des utilisateurs paginés', error);
      }
    });
  }
  

  // Méthode pour changer de page et relancer la requête
  onPageChange(newPage: number): void {
    const maxPage = this.accountService.paginatedResult()?.pagination?.totalPages || 1;
    this.pageNumber = Math.min(Math.max(newPage, 1), maxPage);
    this.jumpPage = this.pageNumber;
    this.getUsers();
  }

  // Saut direct vers une page donnée
  jumpToPage(): void {
    const totalPages = this.paginatedResult?.pagination?.totalPages || 1;
    // Convertir en nombre et vérifier les limites
    this.jumpPage = Math.min(Math.max(Number(this.jumpPage), 1), totalPages);
    this.onPageChange(this.jumpPage);
  }

  // Retourne un tableau de numéros de page [1, 2, ..., totalPages]
  getPages(): number[] {
    const totalPages = this.accountService.paginatedResult()?.pagination?.totalPages || 0;
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // Méthode de sélection de tous les utilisateurs de la page courante
  selectAll(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const currentItems = this.accountService.paginatedResult()?.items || [];
    currentItems.forEach(user => user.selected = checkbox.checked);
    // Mettre à jour le signal pour que le changement soit pris en compte
    this.accountService.paginatedResult.set({
      ...this.accountService.paginatedResult(),
      items: currentItems
    });
  }

  // Méthode de bascule de la sélection d'un utilisateur
  toggleSelection(user: User): void {
    user.selected = !user.selected;
    const currentItems = this.accountService.paginatedResult()?.items || [];
    const allSelected = currentItems.every(u => u.selected);
    const selectAllCheckbox = document.getElementById('selectAll') as HTMLInputElement;
    if (selectAllCheckbox) {
      selectAllCheckbox.checked = allSelected;
    }
    // Mise à jour du signal
    this.accountService.paginatedResult.set({
      ...this.accountService.paginatedResult(),
      items: currentItems
    });
  }

  // Retourne la classe CSS en fonction du rôle
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
  
}
