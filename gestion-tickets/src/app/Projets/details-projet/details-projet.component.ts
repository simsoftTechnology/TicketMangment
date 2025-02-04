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
  // selectedUser et showUserSelector ne sont plus utilisés ici, le choix se fait dans le dialog

  constructor(
    private route: ActivatedRoute,
    private projetService: ProjetService,
    private accountService: AccountService,
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

  getMembres(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.projetService.getMembresProjet(id).subscribe({
        next: (data) => { this.membres = data; },
        error: (err) => { console.error('Erreur lors de la récupération des membres', err); }
      });
    }
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
    this.getProjetDetails();
  }

  selectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.membres.forEach(membre => membre.selected = checked);
  }

  toggleSelection(membre: ProjetMember): void {
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
    this.accountService.getUsers().subscribe({
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
}
