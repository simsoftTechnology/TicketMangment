import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
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
import { OverlayModalService } from '../../_services/overlay-modal.service';
import { DropdownService } from './../../_services/dropdown.service';

@Component({
    selector: 'app-ajouter-projet',
    imports: [CommonModule, FormsModule, NgIf, RouterLink],
    templateUrl: './ajouter-projet.component.html',
    styleUrls: ['./ajouter-projet.component.css']
})
export class AjouterProjetComponent implements OnInit {
  @Input() isWizard: boolean = false;
  @Input() societeId?: number; // pour pré-remplir ou filtrer selon la société
  @Output() projetCreated = new EventEmitter<any>();

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
  utilisateurs: User[] = [];
  chefsProjet: User[] = [];
  developpeurs: User[] = [];
  selectedChefId: number | null = null;
  selectedDevIds: number[] = [];
  erreurMessage: string = '';

  isDropdownOpen = false;
  searchQuery = '';
  filteredDevelopers: User[] = [];

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

  // Par défaut, on initialise le type à Société
  isSocieteProjet: boolean = true;

  constructor(
    private projetService: ProjetService,
    private societeService: SocieteService,
    private paysService: PaysService,
    private userService: AccountService,
    private router: Router,
    private dropdownService: DropdownService,
    public route: ActivatedRoute,
    private overlayModalService: OverlayModalService
  ) { }

  ngOnInit(): void {
    this.loadSocietes();
    this.loadPays();
    this.loadUtilisateurs();
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
        this.chefsProjet = data.filter(user => user.role.toLowerCase().trim() === 'chef de projet');
        this.developpeurs = data.filter(user => user.role.toLowerCase().includes('collaborateur'));
        this.clients = data.filter(user => user.role.toLowerCase().trim() === 'client');
      },
      error => { console.error('Erreur chargement utilisateurs', error); }
    );
  }

  ajouterProjet(): void {
    // Vérifiez les champs obligatoires (nom, chef, et société)
    if (!this.projet.nom || !this.selectedChefId) {
      this.erreurMessage = "Veuillez remplir tous les champs obligatoires.";
      return;
    }
    
    if (this.isSocieteProjet && !this.projet.societeId) {
      this.erreurMessage = "Veuillez sélectionner une société.";
      return;
    } else if (!this.isSocieteProjet && !this.projet.clientId) {
      this.erreurMessage = "Veuillez sélectionner un client.";
      return;
    }
    
    if (this.isSocieteProjet) {
      this.projet.clientId = null;
    } else {
      this.projet.societeId = null;
    }
    
    // Conversion en nombre si nécessaire
    this.projet.idPays = +this.projet.idPays;
    
    this.projetService.addProjet(this.projet).subscribe({
      next: (projetCree) => {
        if (this.isWizard) {
          this.projetCreated.emit(projetCree);
        } else {
          this.ajouterUtilisateursAuProjet(projetCree.id);
        }
      },
      error: (error) => {
        console.error('Erreur ajout projet', error);
        this.erreurMessage = "Erreur lors de l'ajout du projet.";
      }
    });
    
  }
  

  ajouterUtilisateursAuProjet(projetId: number): void {
    const requests = [];

    if (this.selectedChefId) {
      requests.push(
        this.projetService.ajouterUtilisateurAuProjet(projetId, this.selectedChefId)
      );
    }

    this.selectedDevIds.forEach(devId => {
      requests.push(
        this.projetService.ajouterUtilisateurAuProjet(projetId, devId)
      );
    });

    if (requests.length === 0) {
      this.router.navigate(['/home/Projets']);
      return;
    }

    forkJoin(requests).subscribe({
      next: () => {
        this.router.navigate(['/home/Projets']);
      },
      error: (err) => {
        console.error('Erreur lors de l\'ajout des utilisateurs', err.error || err);
      }
    });
  }

  filterDevelopers(): void {
    this.filteredDevelopers = this.developpeurs.filter(dev =>
      `${dev.firstName} ${dev.lastName}`.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

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
      this.isDropdownOpen = !this.isDropdownOpen;
      if (this.isDropdownOpen) {
        this.filteredDevelopers = [...this.developpeurs];
      }
    }
  }

  filterItems(type: string): void {
    switch (type) {
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

  selectItem(item: any, type: string): void {
    switch (type) {
      case 'societe':
        this.projet.societeId = item.id;
        // Trouver la société sélectionnée et mettre à jour le pays
        const selectedSociete = this.societes.find(s => s.id === item.id);
        if (selectedSociete) {
          this.projet.idPays = selectedSociete.paysId; // Assurez-vous que Societe possède idPays
        }
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
