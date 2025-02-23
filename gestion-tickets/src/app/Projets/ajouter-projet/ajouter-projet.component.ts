import { DropdownService } from './../../_services/dropdown.service';
import { Component, HostListener, OnInit } from '@angular/core';
import { Pays } from '../../_models/pays';
import { Societe } from '../../_models/societe';
import { ProjetService } from '../../_services/projet.service';
import { SocieteService } from '../../_services/societe.service';
import { PaysService } from '../../_services/pays.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Projet } from '../../_models/Projet';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import { AccountService } from '../../_services/account.service';
import { User } from '../../_models/user';
import { forkJoin } from 'rxjs';
import { ProjetModalComponent } from '../projet-modal/projet-modal.component';

@Component({
  selector: 'app-ajouter-projet',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf, RouterLink, ProjetModalComponent],
  templateUrl: './ajouter-projet.component.html',
  styleUrls: ['./ajouter-projet.component.css']
})
export class AjouterProjetComponent implements OnInit {
  projet: Projet = {
    id: 0,
    nom: '',
    description: '',
    societeId: undefined,
    clientId: undefined,
    idPays: 0
  };

  societes: Societe[] = [];
  pays: Pays[] = [];
  utilisateurs: User[] = []; // Liste des utilisateurs
  chefsProjet: User[] = [];
  developpeurs: User[] = [];
  selectedChefId: number | null = null;
  selectedDevIds: number[] = [];
  erreurMessage: string = '';

  // Dropdown pour développeurs (multisélection)
  isDropdownOpen = false;
  searchQuery = '';
  filteredDevelopers: User[] = [];

  // Dropdown pour pays, société et chef
  isPaysDropdownOpen = false;
  isSocieteDropdownOpen = false;
  isChefDropdownOpen = false;
  isClientDropdownOpen = false;

  searchClient = '';
  searchPays = '';
  searchSociete = '';
  searchChef = '';

  filteredPays: Pays[] = [];
  filteredSocietes: Societe[] = [];
  filteredChefs: User[] = [];
  filteredClients: User[] = [];
  clients: User[] = [];

  // Contrôle l'affichage de la modale
  showProjectTypeModal: boolean = true;

  // Par défaut, on peut initialiser le type à Société
  isSocieteProjet: boolean = true;

  constructor(
    private projetService: ProjetService,
    private societeService: SocieteService,
    private paysService: PaysService,
    private userService: AccountService, // Service pour les utilisateurs
    private router: Router,
    private dropdownService: DropdownService,
    public route: ActivatedRoute
    
  ) { }

  ngOnInit(): void {
    this.loadSocietes();
    this.loadPays();
    this.loadUtilisateurs();
    this.showProjectTypeModal = true;
  }

  

  // Méthode appelée depuis le modal lorsque l'utilisateur fait un choix
  onProjectTypeSelected(isSociete: boolean): void {
    this.isSocieteProjet = isSociete;
    this.showProjectTypeModal = false;
  }

  // Méthode pour fermer la modale sans sélectionner
  onModalClose(): void {
    this.showProjectTypeModal = false;
  }
  

  loadSocietes(): void {
    this.societeService.getSocietes().subscribe(
      data => { this.societes = data; },
      error => { console.error('Erreur chargement sociétés', error); }
    );
  }

  loadPays(): void {
    this.paysService.getPays().subscribe(
      data => { this.pays = data; },
      error => { console.error('Erreur chargement pays', error); }
    );
  }

  loadUtilisateurs(): void {
    this.userService.getAllUsers().subscribe(
      data => {
        this.utilisateurs = data;
        // Filtrer selon les rôles
        this.chefsProjet = data.filter(user => user.role.toLowerCase().trim() === 'chef de projet');
        this.developpeurs = data.filter(user => user.role.toLowerCase().includes('développeur'));
        // On suppose que le rôle client est défini (par exemple "client")
        this.clients = data.filter(user => user.role.toLowerCase().trim() === 'client');
      },
      error => { console.error('Erreur chargement utilisateurs', error); }
    );
  }
  

  ajouterProjet(): void {
    // Vérification commune
    if (!this.projet.nom || !this.projet.idPays || !this.selectedChefId) {
      this.erreurMessage = "Veuillez remplir tous les champs obligatoires.";
      return;
    }

    // Selon le type de projet, on doit avoir soit une société soit un client
    if (this.isSocieteProjet && !this.projet.societeId) {
      this.erreurMessage = "Veuillez sélectionner une société.";
      return;
    } else if (!this.isSocieteProjet && !this.projet.clientId) {
      this.erreurMessage = "Veuillez sélectionner un client.";
      return;
    }

    // Avant l'envoi, on s'assure que l'autre champ est à null (si besoin)
    if (this.isSocieteProjet) {
      this.projet.clientId = null;
    } else {
      this.projet.societeId = null;
    }

    // S'assurer que les valeurs sont bien des nombres si nécessaire
    this.projet.idPays = +this.projet.idPays;

    this.projetService.addProjet(this.projet).subscribe({
      next: (projetCree) => {
        this.ajouterUtilisateursAuProjet(projetCree.id);
      },
      error: (error) => {
        console.error('Erreur ajout projet', error);
        this.erreurMessage = "Erreur lors de l'ajout du projet.";
      }
    });
  }

  ajouterUtilisateursAuProjet(projetId: number): void {
    const requests = [];

    // Ajouter le chef de projet
    if (this.selectedChefId) {
      requests.push(
        this.projetService.ajouterUtilisateurAuProjet(projetId, this.selectedChefId, 'Chef de Projet')
      );
    }

    // Ajouter les développeurs
    this.selectedDevIds.forEach(devId => {
      requests.push(
        this.projetService.ajouterUtilisateurAuProjet(projetId, devId, 'Développeur')
      );
    });

    if (requests.length === 0) {
      this.router.navigate(['/home/liste-projets']);
      return;
    }

    forkJoin(requests).subscribe({
      next: () => {
        this.router.navigate(['/home/liste-projets']);
      },
      error: (err) => {
        console.error('Erreur lors de l\'ajout des utilisateurs', err.error || err);
      }
    });
  }

  // Filtrage des développeurs pour la multisélection
  filterDevelopers(): void {
    this.filteredDevelopers = this.developpeurs.filter(dev =>
      `${dev.firstName} ${dev.lastName}`.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  // Sélection / déselection d'un développeur
  toggleSelection(devId: number): void {
    const index = this.selectedDevIds.indexOf(devId);
    if (index === -1) {
      this.selectedDevIds.push(devId);
    } else {
      this.selectedDevIds.splice(index, 1);
    }
  }

  isSelected(devId: number): boolean {
    return this.selectedDevIds.includes(devId);
  }

  getDeveloperName(devId: number): string {
    const dev = this.developpeurs.find(d => d.id === devId);
    return dev ? `${dev.firstName} ${dev.lastName}` : '';
  }

  /**
   * Méthode unique pour basculer l'ouverture/fermeture des dropdowns.
   * Si aucun type n'est fourni, on bascule le dropdown des développeurs (multisélection).
   */
  toggleDropdown(type?: string): void {
    if (type) {
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
        case 'chef':
          this.isChefDropdownOpen = !this.isChefDropdownOpen;
          if (this.isChefDropdownOpen) {
            this.filteredChefs = [...this.chefsProjet];
          }
          break;
        case 'client':
          this.isClientDropdownOpen = !this.isClientDropdownOpen;
          if (this.isClientDropdownOpen) {
            this.filteredClients = [...this.clients];
          }
          break;
      }
    } else {
      // Dropdown pour la multisélection des développeurs
      this.isDropdownOpen = !this.isDropdownOpen;
      if (this.isDropdownOpen) {
        this.filteredDevelopers = [...this.developpeurs];
      }
    }
  }

  // Filtrage pour pays, société et chef en fonction de la recherche
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
      case 'chef':
        this.filteredChefs = this.chefsProjet.filter(c =>
          `${c.firstName} ${c.lastName}`.toLowerCase().includes(this.searchChef.toLowerCase())
        );
        break;
      case 'client':
        this.filteredClients = this.clients.filter(c =>
          `${c.firstName} ${c.lastName}`.toLowerCase().includes(this.searchClient.toLowerCase())
        );
        break;
    }
  }

  // Sélection d'un élément dans un dropdown (pays, société, chef)
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
      case 'chef':
        this.selectedChefId = item.id;
        this.isChefDropdownOpen = false;
        break;
      case 'client':
        this.projet.clientId = item.id;
        this.isClientDropdownOpen = false;
        break;
    }
  }

  getPaysName(idPays: number): string {
    return this.pays.find(p => p.idPays === idPays)?.nom || '';
  }

  getSocieteName(idSociete: number | null | undefined): string {
    if (idSociete == null) return '';
    return this.societes.find(s => s.id === idSociete)?.nom || '';
  }
  

  getChefName(idChef: number | null): string {
    if (!idChef) return '';
    const chef = this.chefsProjet.find(c => c.id === idChef);
    return chef ? `${chef.firstName} ${chef.lastName}` : '';
  }

  getClientName(clientId: number | null | undefined): string {
  if (clientId == null) return '';
  const client = this.clients.find(c => c.id === clientId);
  return client ? `${client.firstName} ${client.lastName}` : '';
}

  // Fermer les dropdowns si clic en dehors
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!event.target) return;

    const target = event.target as HTMLElement;
    const dropdowns = [
      { isOpen: this.isPaysDropdownOpen, selector: '.custom-select' },
      { isOpen: this.isSocieteDropdownOpen, selector: '.custom-select' },
      { isOpen: this.isChefDropdownOpen, selector: '.custom-select' },
      { isOpen: this.isDropdownOpen, selector: '.custom-multiselect' }
    ];

    dropdowns.forEach(dropdown => {
      if (dropdown.isOpen && !target.closest(dropdown.selector)) {
        this.closeAllDropdowns();
      }
    });
  }

  closeAllDropdowns(): void {
    this.isPaysDropdownOpen = false;
    this.isSocieteDropdownOpen = false;
    this.isChefDropdownOpen = false;
    this.isDropdownOpen = false;
  }
}