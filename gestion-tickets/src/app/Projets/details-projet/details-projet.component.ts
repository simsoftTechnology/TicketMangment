import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { Projet } from '../../_models/Projet';
import { ProjetMember } from '../../_models/projet-member';
import { User } from '../../_models/user';
import { Pays } from '../../_models/pays';
import { Societe } from '../../_models/societe';

import { ProjetService } from '../../_services/projet.service';
import { AccountService } from '../../_services/account.service';
import { PaysService } from '../../_services/pays.service';
import { SocieteService } from '../../_services/societe.service';
import { UserSelectorDialogComponent } from '../../user-selector-dialog/user-selector-dialog.component';
import { PaginatedResult } from '../../_models/pagination';
import { ToastrService } from 'ngx-toastr';
import { OverlayModalService } from '../../_services/overlay-modal.service';
import { ConfirmModalComponent } from '../../confirm-modal/confirm-modal.component';
import { LoaderService } from '../../_services/loader.service';
import { GlobalLoaderService } from '../../_services/global-loader.service';

@Component({
  selector: 'app-details-projet',
  imports: [FormsModule, CommonModule, NgSelectModule, MatDialogModule],
  templateUrl: './details-projet.component.html',
  styleUrls: ['./details-projet.component.scss']
})
export class DetailsProjetComponent implements OnInit {
  // --- Données du projet et membres ---
  projet!: Projet;
  membres: ProjetMember[] = [];

  // Pagination (client-side) pour les membres du projet
  pageNumber: number = 1;
  pageSize: number = 9;
  jumpPage: number = 1;
  totalPages: number = 1;

  // Recherche dans le tableau des membres
  userSearchTerm: string = '';

  // --- Dropdown Pays ---
  pays: Pays[] = [];
  filteredPays: Pays[] = [];
  paysSearchTerm: string = '';
  isPaysDropdownOpen: boolean = false;

  // --- Dropdown Société ---
  societes: Societe[] = [];
  filteredSocietes: Societe[] = [];
  searchSociete: string = '';
  isSocieteDropdownOpen: boolean = false;

  // --- Mode édition ---
  editMode: boolean = false;

  // --- Gestion des utilisateurs (pour la boîte modale) ---
  availableUsers: Partial<User>[] = [];

  // (Optionnel) Pagination & recherche côté serveur pour les utilisateurs
  userPageNumber: number = 1;
  userPageSize: number = 1;
  userTotalPages: number = 1;
  totalUsers: number = 0;
  displayedUsers: User[] = [];
  userJumpPage: number = 1;

  isChefDropdownOpen: boolean = false;
  searchChef: string = '';
  availableChefs: User[] = []; 
  filteredChefs: User[] = [];

  isLoading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private projetService: ProjetService,
    public accountService: AccountService,
    private paysService: PaysService,
    private societeService: SocieteService,
    private toastr: ToastrService,
    public router: Router,
    private dialog: MatDialog,
    private location: Location,
    private elementRef: ElementRef,
    private overlayModalService: OverlayModalService,
    private loaderService: LoaderService,
    private globalLoaderService: GlobalLoaderService 
  ) {
    this.loaderService.isLoading$.subscribe((loading) => {
      this.isLoading = loading;
    });
   }

  ngOnInit(): void {
    // S'abonner aux paramètres de la route pour détecter les changements de l'ID du projet
    this.route.params.subscribe(params => {
      const id = Number(params['id']);
      if (id) {
        this.getProjetDetails(id);
      }
    });
    this.getAvailableUsers();
    this.getAvailableChefs();
    this.loadPays();
    this.loadSocietes();
    this.loadUsers(); // Pour la recherche/pagination côté serveur (si nécessaire)
  }

  // --- Chargement du projet et de ses membres ---
  getProjetDetails(id: number): void {
    this.globalLoaderService.showGlobalLoader();
    this.projetService.getProjetById(id).subscribe({
      next: (data) => {
        this.projet = data;
        this.getMembres();
      },
      error: (err) => {
        console.error('Erreur lors de la récupération du projet', err);
        this.toastr.error('Erreur lors de la récupération du projet');
      },
      complete: () => {
        this.globalLoaderService.hideGlobalLoader();
      }
    });
  }  

  getAvailableChefs(): void {
    this.accountService.getAllUsers().subscribe({
      next: (users: User[]) => {
        // Vous pouvez appliquer ici un filtre sur les rôles si nécessaire.
        this.availableChefs = users.filter(user => {
          const role = user.role.toLowerCase().trim();
          // Par exemple, pour inclure les utilisateurs avec le rôle "chef de projet" ou "collaborateur"
          return role === 'chef de projet' || role === 'collaborateur';
        });
        this.filteredChefs = [...this.availableChefs];
      },
      error: (err) => console.error("Erreur lors de la récupération des utilisateurs", err)
    });
  }
  

  getMembres(): void {
    if (this.projet && this.projet.id) {
      this.projetService.getMembresProjet(this.projet.id).subscribe({
        next: (data: ProjetMember[]) => {
          // Affecte la liste des membres récupérée
          this.membres = data;
          // Si un chef de projet est défini et qu'il n'est pas déjà dans la liste, on l'ajoute
          if (this.projet.chefProjet && !this.membres.some(m => m.userId === this.projet.chefProjet!.id)) {
            const chefMember: ProjetMember = {
              projetId: this.projet.id, // Ajout de la propriété manquante
              userId: this.projet.chefProjet.id,
              firstName: this.projet.chefProjet.firstName,
              lastName: this.projet.chefProjet.lastName,
              role: this.projet.chefProjet.role ? this.projet.chefProjet.role : 'Chef de projet',
              selected: false
            };
            this.membres.unshift(chefMember);
          }
        },
        error: (err) => { console.error('Erreur lors du chargement des membres', err); }
      });
    }
  }


  // --- Filtrage et pagination des membres (client-side) ---
  get displayedMembres(): ProjetMember[] {
    let filteredMembres = this.membres;
    if (this.userSearchTerm && this.userSearchTerm.trim() !== '') {
      const term = this.userSearchTerm.toLowerCase();
      filteredMembres = this.membres.filter(m =>
        (m.firstName + ' ' + m.lastName).toLowerCase().includes(term)
      );
    }
    this.totalPages = Math.ceil(filteredMembres.length / this.pageSize) || 1;
    const start = (this.pageNumber - 1) * this.pageSize;
    return filteredMembres.slice(start, start + this.pageSize);
  }

  onUserSearch(): void {
    this.pageNumber = 1;
  }

  onPageChange(newPage: number): void {
    this.pageNumber = Math.min(Math.max(newPage, 1), this.totalPages);
    this.jumpPage = this.pageNumber;
  }

  jumpToPage(): void {
    if (this.jumpPage >= 1 && this.jumpPage <= this.totalPages) {
      this.pageNumber = this.jumpPage;
    } else {
      console.warn('Numéro de page invalide');
    }
  }

  selectAll(event: any): void {
    const checked = event.target.checked;
    this.membres.forEach(m => m.selected = checked);
  }

  toggleSelection(membre: ProjetMember): void {
    console.log('Membre sélectionné/désélectionné :', membre);
  }

  // --- Recherche et pagination côté serveur pour les utilisateurs (pour la modale, si nécessaire) ---
  loadUsers(): void {
    this.accountService.getUsers(this.userPageNumber, this.userPageSize, this.userSearchTerm)
      .subscribe((result: PaginatedResult<User[]>) => {
        this.displayedUsers = result.items ?? [];
        this.userTotalPages = result.pagination?.totalPages ?? 1;
      }, error => {
        console.error('Erreur lors du chargement des utilisateurs paginés', error);
      });
  }

  // --- Navigation (exemple de redirection) ---
  viewProjet(projetId: number): void {
    this.router.navigate(['/home/projets/details', projetId]);
  }

  // --- Gestion des dropdowns pour Pays ---
  loadPays(): void {
    this.paysService.getPays(this.paysSearchTerm).subscribe({
      next: (data) => {
        this.filteredPays = data;
        this.pays = data;
      },
      error: (err) => { console.error('Erreur lors de la récupération des pays', err); }
    });
  }

  onPaysSearch(): void {
    this.loadPays();
  }

  // --- Gestion des dropdowns pour Société ---
  loadSocietes(): void {
    this.societeService.getSocietes(this.searchSociete).subscribe({
      next: (data) => {
        this.filteredSocietes = data;
        this.societes = data;
      },
      error: (err) => { console.error('Erreur lors de la récupération des sociétés', err); }
    });
  }

  onSocieteSearch(): void {
    this.loadSocietes();
  }

  // Empêcher la propagation du clic dans les dropdowns
  toggleDropdown(type: string): void {
    if (type === 'pays') {
      this.isPaysDropdownOpen = !this.isPaysDropdownOpen;
      if (this.isPaysDropdownOpen) {
        this.isSocieteDropdownOpen = false;
        this.isChefDropdownOpen = false;
      }
    } else if (type === 'societe') {
      this.isSocieteDropdownOpen = !this.isSocieteDropdownOpen;
      if (this.isSocieteDropdownOpen) {
        this.isPaysDropdownOpen = false;
        this.isChefDropdownOpen = false;
      }
    } else if  (type === 'chef') {
      this.isChefDropdownOpen = !this.isChefDropdownOpen;
      if (this.isChefDropdownOpen) {
        this.isPaysDropdownOpen = false;
        this.isSocieteDropdownOpen = false;
      }
    } 
  }



  // Récupération du nom du pays à partir de son identifiant
  getPaysName(idPays: number): string {
    return this.pays.find(p => p.idPays === idPays)?.nom || '';
  }

  // Récupération du nom de la société à partir de son identifiant
  getSocieteName(idSociete: number | null | undefined): string {
    if (!idSociete) {
      return '';
    }
    return this.societes.find(s => s.id === idSociete || s.id === idSociete)?.nom || '';
  }


  // Méthode de sélection d'une société dans le dropdown
  selectSociete(societe: any): void {
    // Affecte l'identifiant de la société
    this.projet.societeId = societe.id || societe.idSociete;
    // Affecte automatiquement l'id du pays de la société au projet
    this.projet.idPays = societe.paysId;
    // Ferme le dropdown
    this.isSocieteDropdownOpen = false;
    // Réinitialise le champ de recherche et recharge la liste complète
    this.searchSociete = '';
    this.loadSocietes();
  }


  // --- Sauvegarde, annulation et suppression du projet ---
  saveProjet(): void {
    const modalInstance = this.overlayModalService.open(ConfirmModalComponent);
    modalInstance.message = "Confirmez-vous la modification du projet ?";
    modalInstance.confirmed.subscribe(() => {
    this.projet.nom = this.accountService.removeSpecial(this.projet.nom)

      this.loaderService.showLoader();
      this.projetService.updateProjet(this.projet).subscribe({
        next: () => {
          this.toastr.success('Projet mis à jour avec succès');
          this.editMode = false;
          this.getProjetDetails(this.projet.id);
          this.loaderService.hideLoader();
        },
        error: (err) => {
          console.error('Erreur lors de la mise à jour du projet', err);
          this.toastr.error('Erreur lors de la mise à jour du projet');
          this.loaderService.hideLoader();
        }
      });
      this.overlayModalService.close();
    });
    modalInstance.cancelled.subscribe(() => {
      this.overlayModalService.close();
    });
  }


  cancelEdit(): void {
    this.editMode = false;
    // Recharger les détails du projet en passant l'ID du projet
    this.getProjetDetails(this.projet.id);
  }



  // --- Gestion des utilisateurs dans la modale ---
  openUserSelector(): void {
    const dialogRef = this.dialog.open(UserSelectorDialogComponent, {
      data: { availableUsers: this.availableUsers }
    });

    dialogRef.afterClosed().subscribe((selectedUser: User) => {
      if (selectedUser) {
        this.addUserToProjet(selectedUser);
      }
    });
  }

  getAvailableUsers(): void {
    this.accountService.getAllUsers().subscribe({
      next: (users: User[]) => {
        this.availableUsers = users.map(user => ({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          email: user.email
        }));
      },
      error: (err) => console.error("Erreur lors de la récupération des utilisateurs", err)
    });
  }


  addUserToProjet(user: User): void {
    if (this.projet && this.projet.id && user.id) {
      this.projetService.ajouterUtilisateurAuProjet(this.projet.id, user.id, user.role)
        .subscribe({
          next: () => {
            // Par exemple, afficher une notification de succès
            this.toastr.success('Utilisateur ajouté avec succès');
            this.getMembres();
          },
          error: (err) => {
            if (err.status === 409) {
              this.toastr.error(err.error.message, 'Erreur');
            } else {
              console.error('Erreur lors de l’ajout de l’utilisateur', err);
            }
          }
        });
    } else {
      this.toastr.warning("Veuillez sélectionner un utilisateur valide.");
    }
  }


  removeUser(userId: number): void {
    if (this.projet && this.projet.id) {
      const modalInstance = this.overlayModalService.open(ConfirmModalComponent);
      modalInstance.message = 'Confirmer la suppression de cet utilisateur du projet ?';
      modalInstance.confirmed.subscribe(() => {
        this.loaderService.showLoader();
        this.projetService.supprimerUtilisateurDuProjet(this.projet.id, userId)
          .subscribe({
            next: () => {
              this.toastr.success('Utilisateur retiré avec succès');
              this.getMembres();
              this.loaderService.hideLoader();
            },
            error: (err) => {
              console.error('Erreur lors du retrait de l’utilisateur', err);
              this.loaderService.hideLoader();
            }
          });
        this.overlayModalService.close();
      });
      modalInstance.cancelled.subscribe(() => {
        this.overlayModalService.close();
      });
    }
  }


  // --- Utilitaire pour générer une plage de nombres pour la pagination ---
  range(start: number, end: number): number[] {
    return Array(end - start + 1).fill(0).map((_, i) => start + i);
  }


  deleteSelectedMembers(): void {
    const selectedUserIds = this.membres.filter(m => m.selected).map(m => m.userId);
    if (selectedUserIds.length === 0) {
      this.toastr.warning("Aucun membre sélectionné pour la suppression.");
      return;
    }
    const modalInstance = this.overlayModalService.open(ConfirmModalComponent);
    modalInstance.message = "Êtes-vous sûr de vouloir retirer les membres sélectionnés du projet ?";
    modalInstance.confirmed.subscribe(() => {
      this.loaderService.showLoader();
      selectedUserIds.forEach(userId => {
        this.projetService.supprimerUtilisateurDuProjet(this.projet.id, userId)
          .subscribe({
            next: () => this.getMembres(),
            error: err => console.error("Erreur lors du retrait de l’utilisateur", err)
          });
      });
      this.loaderService.hideLoader();
      this.overlayModalService.close();
    });
    modalInstance.cancelled.subscribe(() => {
      this.overlayModalService.close();
    });
  }

  onChefSearch(): void {
    if (this.searchChef && this.searchChef.trim() !== '') {
      const term = this.searchChef.toLowerCase();
      this.filteredChefs = this.availableChefs.filter(chef =>
        (chef.firstName + ' ' + chef.lastName).toLowerCase().includes(term)
      );
    } else {
      this.filteredChefs = [...this.availableChefs];
    }
  }

  selectChef(chef: User): void {
    // Met à jour l'identifiant du chef dans le projet
    this.projet.chefProjetId = chef.id;
    // Optionnel : Mettre à jour l'objet complet du chef
    this.projet.chefProjet = chef;
    // Fermer le dropdown
    this.isChefDropdownOpen = false;
    // Réinitialiser le champ de recherche si besoin
    this.searchChef = '';
    this.filteredChefs = [...this.availableChefs];
  }

  getChefName(chefId: number | undefined): string {
    if (chefId === undefined) return '';
    const chef = this.availableChefs.find(c => c.id === chefId);
    return chef ? `${chef.firstName} ${chef.lastName}` : '';
  }
  
  

  // Gestionnaire de clic global pour fermer les dropdowns
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    // Vérifiez si le clic se produit en dehors d'un élément ayant la classe 'custom-select'
    if (!target.closest('.custom-select')) {
      this.isPaysDropdownOpen = false;
      this.isSocieteDropdownOpen = false;
      this.isChefDropdownOpen = false;
    }
  }

  goBack(): void {
    this.location.back();
  }
}
