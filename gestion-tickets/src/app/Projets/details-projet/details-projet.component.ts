import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
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

@Component({
  selector: 'app-details-projet',
  standalone: true,
  imports: [FormsModule, CommonModule, NgSelectModule, MatDialogModule, RouterLink],
  templateUrl: './details-projet.component.html',
  styleUrls: ['./details-projet.component.css']
})
export class DetailsProjetComponent implements OnInit {
  // Données du projet
  projet!: Projet;
  membres: ProjetMember[] = [];

  // Variables pour la pagination
  pageNumber: number = 1;
  pageSize: number = 9;
  paginatedResult: PaginatedResult<User[]> | null = null;
  jumpPage: number = 1;

  // Dropdown pour Pays et Société
  isPaysDropdownOpen = false;
  isSocieteDropdownOpen = false;
  searchPays = '';
  searchSociete = '';
  filteredPays: Pays[] = [];
  filteredSocietes: Societe[] = [];
  // Listes complètes (chargées depuis le service)
  pays: Pays[] = [];
  societes: Societe[] = [];

  // Pour le mode édition
  editMode: boolean = false;

  // Pour la sélection d'un nouvel utilisateur via la boîte modale
  availableUsers: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private projetService: ProjetService,
    public accountService: AccountService,
    private paysService: PaysService,
    private societeService: SocieteService,
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.getProjetDetails();
    this.getMembres();
    this.getAvailableUsers();
    this.loadPays();
    this.loadSocietes();
  }

  getProjetDetails(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.projetService.getProjetById(id).subscribe({
        next: (data) => { this.projet = data; },
        error: (err) => { console.error('Erreur lors de la récupération du projet', err); }
      });
    }
  }

  // Récupère l'ensemble des membres du projet
  getMembres(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.projetService.getMembresProjet(id).subscribe({
        next: (data) => {
          this.membres = data;
          // Remise à zéro de la page lors du rafraîchissement des données
          this.pageNumber = 1;
        },
        error: (err) => { console.error('Erreur lors de la récupération des membres', err); }
      });
    }
  }

  // Getter pour le nombre total de pages (basé sur la liste des membres)
  get totalPages(): number {
    return Math.ceil(this.membres.length / this.pageSize);
  }

  // Retourne uniquement les membres de la page courante
  get displayedMembres(): ProjetMember[] {
    const startIndex = (this.pageNumber - 1) * this.pageSize;
    return this.membres.slice(startIndex, startIndex + this.pageSize);
  }

  // Retourne un tableau de numéros de page [1, 2, ..., totalPages]
  getPages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  // Méthode de changement de page
  onPageChange(newPage: number): void {
    if (newPage < 1 || newPage > this.totalPages) {
      return;
    }
    this.pageNumber = newPage;
    // Si nécessaire, mettez également à jour jumpPage pour refléter la page actuelle
    this.jumpPage = newPage;
  }

  // Saut direct vers une page donnée
  // Sauter directement à une page donnée
  jumpToPage(): void {
    // Assurez-vous que jumpPage est dans les limites
    this.jumpPage = Math.min(Math.max(Number(this.jumpPage), 1), this.totalPages);
    this.onPageChange(this.jumpPage);
  }

  loadPays(): void {
    this.paysService.getPays().subscribe({
      next: (data) => {
        this.pays = data;
        this.filteredPays = [...data];
      },
      error: (err) => { console.error('Erreur lors de la récupération des pays', err); }
    });
  }

  loadSocietes(): void {
    this.societeService.getSocietes().subscribe({
      next: (data) => {
        this.societes = data;
        this.filteredSocietes = [...data];
      },
      error: (err) => { console.error('Erreur lors de la récupération des sociétés', err); }
    });
  }

  deleteProjet(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer ce projet ?')) {
      this.projetService.deleteProjet(id).subscribe({
        next: () => {
          alert('Projet supprimé avec succès');
          this.router.navigate(['/projets']);
        },
        error: (err) => { console.error('Erreur lors de la suppression du projet', err); }
      });
    }
  }

  saveProjet(): void {
    this.projetService.updateProjet(this.projet).subscribe({
      next: () => {
        alert('Projet mis à jour avec succès');
        this.editMode = false;
      },
      error: (err) => { console.error('Erreur lors de la mise à jour du projet', err); }
    });
  }

  cancelEdit(): void {
    this.editMode = false;
    // Rechargement des détails pour annuler les modifications locales
    this.getProjetDetails();
  }

  // Sélection/désélection de tous les membres affichés
  selectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.displayedMembres.forEach(membre => membre.selected = checked);
  }

  toggleSelection(membre: ProjetMember): void {
    // Logique supplémentaire lors de la sélection/désélection d’un membre
    console.log('Membre sélectionné/désélectionné :', membre);
  }

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
      this.projetService.ajouterUtilisateurAuProjet(
        this.projet.id,
        user.id,
        user.role
      ).subscribe({
        next: () => {
          alert('Utilisateur ajouté avec succès');
          this.getMembres();
        },
        error: (err) => { console.error('Erreur lors de l’ajout de l’utilisateur', err); }
      });
    } else {
      alert("Veuillez sélectionner un utilisateur valide.");
    }
  }

  removeUser(userId: number): void {
    if (this.projet && this.projet.id) {
      if (confirm('Confirmer la suppression de cet utilisateur du projet ?')) {
        this.projetService.supprimerUtilisateurDuProjet(this.projet.id, userId).subscribe({
          next: () => {
            alert('Utilisateur retiré avec succès');
            this.getMembres();
          },
          error: (err) => { console.error('Erreur lors du retrait de l’utilisateur', err); }
        });
      }
    }
  }

  toggleDropdown(type: string): void {
    switch (type) {
      case 'pays':
        this.isPaysDropdownOpen = !this.isPaysDropdownOpen;
        if (this.isPaysDropdownOpen) {
          this.filteredPays = [...this.pays];
        }
        break;
      case 'societe':
        this.isSocieteDropdownOpen = !this.isSocieteDropdownOpen;
        if (this.isSocieteDropdownOpen) {
          this.filteredSocietes = [...this.societes];
        }
        break;
    }
  }

  filterItems(type: string): void {
    switch (type) {
      case 'pays':
        this.filteredPays = this.pays.filter(p =>
          p.nom.toLowerCase().includes(this.searchPays.toLowerCase())
        );
        break;
      case 'societe':
        this.filteredSocietes = this.societes.filter(s =>
          s.nom.toLowerCase().includes(this.searchSociete.toLowerCase())
        );
        break;
    }
  }

  selectItem(item: any, type: string): void {
    switch (type) {
      case 'pays':
        this.projet.idPays = item.idPays;
        this.isPaysDropdownOpen = false;
        break;
      case 'societe':
        this.projet.societeId = item.id;
        this.isSocieteDropdownOpen = false;
        break;
    }
  }

  getPaysName(idPays: number): string {
    return this.pays.find(p => p.idPays === idPays)?.nom || '';
  }

  getSocieteName(idSociete: number): string {
    return this.societes.find(s => s.id === idSociete)?.nom || '';
  }

  range(start: number, end: number): number[] {
    return Array(end - start + 1).fill(0).map((_, i) => start + i);
  }
}
