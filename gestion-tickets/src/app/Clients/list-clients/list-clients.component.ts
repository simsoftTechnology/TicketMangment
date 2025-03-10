import { Component, OnInit, inject } from '@angular/core';
import { AccountService } from '../../_services/account.service';
import { CommonModule, NgClass, NgFor, NgIf } from '@angular/common';
import { User } from '../../_models/user';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { PaginatedResult } from '../../_models/pagination';
@Component({
  selector: 'app-list-clients',
  imports: [ NgFor, NgIf, NgClass, FormsModule, RouterLink, CommonModule],
  templateUrl: './list-clients.component.html',
  styleUrl: './list-clients.component.css'
})
export class ListClientsComponent {

  public accountService = inject(AccountService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  
  
  // Variables pour la pagination
  pageNumber: number = 1;
  pageSize: number = 9;
  paginatedResult: PaginatedResult<User[]> | null = null;
  jumpPage: number = 1;

  // Terme de recherche pour filtrer les utilisateurs
  usersSearchTerm: string = '';

  // Variable pour conserver l'ID du nouvel utilisateur (pour la surbrillance)
  newUserId: number | null = null;

  ngOnInit(): void {
    // Récupérer le paramètre de l'URL
    this.route.queryParams.subscribe(params => {
      const newUser = params['newUser'];
      if (newUser) {
        this.newUserId = +newUser;
        // Force le rechargement de la liste pour inclure le nouvel utilisateur
        this.getUsers();
        // Supprimez le paramètre "newUser" de l'URL pour éviter qu'il ne soit retraité lors d'un rafraîchissement
        this.router.navigate([], {
          queryParams: { newUser: null },
          queryParamsHandling: 'merge',
          replaceUrl: true
        });
        // Supprimez la surbrillance après 5 secondes
        setTimeout(() => { this.newUserId = null; }, 2000);
      } else {
        // S'il n'y a pas de paramètre newUser, rechargez la liste
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

  // Appel du service pour charger la page demandée en passant le terme de recherche
  // Appel du service pour charger la page demandée en passant le terme de recherche
getUsers(): void {
  this.accountService.getUsers(this.pageNumber, this.pageSize, this.usersSearchTerm).subscribe({
    next: (response) => {
      // Conversion et formatage des dates
      const updatedItems = (response.items ?? [])
        .map(user => {
          if (user.contrat) {
            user.contrat.dateDebut = new Date(user.contrat.dateDebut);
            if (user.contrat.dateFin) {
              user.contrat.dateFin = new Date(user.contrat.dateFin);
            }
          }
          return { ...user, selected: false };
        })
        // Filtrer pour ne conserver que les utilisateurs avec le rôle "client"
        .filter(user => user.role.toLowerCase().trim() === 'client');

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

  

  // Méthode déclenchée lors de la modification du terme de recherche
  onSearchChange(): void {
    this.pageNumber = 1;
    this.getUsers();
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

  

  range(start: number, end: number): number[] {
    return Array(end - start + 1).fill(0).map((_, i) => start + i);
  }


  deleteUser(user: User): void {
    if (confirm(`Voulez-vous vraiment supprimer l'utilisateur ${user.firstName} ${user.lastName} ?`)) {
      this.accountService.deleteUser(user.id).subscribe({
        next: () => {
          // Optionnel : afficher un message de succès
          alert('Utilisateur supprimé avec succès.');
          // Rafraîchir la liste
          this.getUsers();
        },
        error: error => {
          console.error('Erreur lors de la suppression de l\'utilisateur', error);
          alert('Une erreur est survenue lors de la suppression.');
        }
      });
    }
  }
}
