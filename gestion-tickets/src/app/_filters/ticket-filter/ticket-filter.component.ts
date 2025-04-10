import { Component, EventEmitter, OnInit, Output, HostListener, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CategorieProblemeService } from '../../_services/categorie-probleme.service';
import { PrioriteService } from '../../_services/priorite.service';
import { QualificationService } from '../../_services/qualification.service';
import { ProjetService } from '../../_services/projet.service';
import { SocieteService } from '../../_services/societe.service';
import { AccountService } from '../../_services/account.service';
import { StatusService } from '../../_services/status.service';
import { CommonModule } from '@angular/common';
import { LoaderService } from '../../_services/loader.service';

@Component({
  selector: 'app-ticket-filter',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './ticket-filter.component.html',
  styleUrls: ['./ticket-filter.component.css']
})
export class TicketFilterComponent implements OnInit {
  filterForm!: FormGroup;
  @Output() applyFilter = new EventEmitter<any>();

  // Variables pour le select Client
  clientOptions: any[] = [];
  filteredClients: any[] = [];
  selectedClient: any = null;
  clientSearchTerm: string = '';
  isClientDropdownOpen: boolean = false;

  // Variables pour le select Catégorie
  categorieOptions: any[] = [];
  filteredCategories: any[] = [];
  selectedCategorie: any = null;
  categorieSearchTerm: string = '';
  isCategorieDropdownOpen: boolean = false;

  // Variables pour le select Priorité
  prioriteOptions: any[] = [];
  filteredPriorites: any[] = [];
  selectedPriorite: any = null;
  prioriteSearchTerm: string = '';
  isPrioriteDropdownOpen: boolean = false;

  // Variables pour le select Statut
  statutOptions: any[] = [];
  filteredStatuts: any[] = [];
  selectedStatut: any = null;
  statutSearchTerm: string = '';
  isStatutDropdownOpen: boolean = false;

  // Variables pour le select Qualification
  qualificationOptions: any[] = [];
  filteredQualifications: any[] = [];
  selectedQualification: any = null;
  qualificationSearchTerm: string = '';
  isQualificationDropdownOpen: boolean = false;

  // Variables pour le select Projet
  projetOptions: any[] = [];
  filteredProjets: any[] = [];
  selectedProjet: any = null;
  projetSearchTerm: string = '';
  isProjetDropdownOpen: boolean = false;

  // Variables pour le select Société
  societeOptions: any[] = [];
  filteredSocietes: any[] = [];
  selectedSociete: any = null;
  societeSearchTerm: string = '';
  isSocieteDropdownOpen: boolean = false;

  isClient: boolean = false;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private elRef: ElementRef,
    private accountService: AccountService,
    private categorieService: CategorieProblemeService,
    private prioriteService: PrioriteService,
    private statutService: StatusService,
    private qualificationService: QualificationService,
    private projetService: ProjetService,
    private societeService: SocieteService,
    private loaderService: LoaderService
  ) {
    this.loaderService.isLoading$.subscribe((loading) => {
      this.isLoading = loading;
    });
   }

  ngOnInit(): void {
    const user = this.accountService.currentUser();
    // Par exemple, si le rôle client est "client", on vérifie ainsi :
    if (user && user.role === 'Client') {
      this.isClient = true;
    }
    this.filterForm = this.fb.group({
      client: [''],
      categorie: [''],
      priorite: [''],
      statut: [''],
      qualification: [''],
      projet: [''],
      societe: ['']
    });

    // Chargement des données depuis la base via les services
    this.loadClients();
    this.loadCategories();
    this.loadPriorites();
    this.loadStatuts();
    this.loadQualifications();
    this.loadProjets();
    this.loadSocietes();
  }

  loadClients(): void {
    this.accountService.getUsersByRole('client').subscribe(clients => {
      this.clientOptions = clients;
      this.filteredClients = [...clients];
    });
  }


  loadCategories(): void {
    this.categorieService.getCategories().subscribe(categories => {
      this.categorieOptions = categories;
      this.filteredCategories = [...categories];
    });
  }

  loadPriorites(): void {
    this.prioriteService.getPriorites().subscribe(priorites => {
      this.prioriteOptions = priorites;
      this.filteredPriorites = [...priorites];
    });
  }

  loadStatuts(): void {
    this.statutService.getStatuses().subscribe(statuts => {
      this.statutOptions = statuts;
      this.filteredStatuts = [...statuts];
    });
  }

  loadQualifications(): void {
    this.qualificationService.getQualifications().subscribe(qualifications => {
      this.qualificationOptions = qualifications;
      this.filteredQualifications = [...qualifications];
    });
  }

  loadProjets(): void {
    this.projetService.getProjets({}).subscribe(projets => {
      this.projetOptions = projets;
      this.filteredProjets = [...projets];
    });
  }

  loadSocietes(): void {
    this.societeService.getSocietes().subscribe(societes => {
      this.societeOptions = societes;
      this.filteredSocietes = [...societes];
    });
  }

  // Méthode pour ouvrir/fermer les dropdowns
  toggleDropdown(type: string): void {
    if (type === 'client') {
      if (this.isClientDropdownOpen) {
        this.isClientDropdownOpen = false;
      } else {
        this.closeAllDropdowns();
        this.isClientDropdownOpen = true;
        this.filteredClients = [...this.clientOptions];
        this.clientSearchTerm = '';
      }
    } else if (type === 'categorie') {
      if (this.isCategorieDropdownOpen) {
        this.isCategorieDropdownOpen = false;
      } else {
        this.closeAllDropdowns();
        this.isCategorieDropdownOpen = true;
        this.filteredCategories = [...this.categorieOptions];
        this.categorieSearchTerm = '';
      }
    } else if (type === 'priorite') {
      if (this.isPrioriteDropdownOpen) {
        this.isPrioriteDropdownOpen = false;
      } else {
        this.closeAllDropdowns();
        this.isPrioriteDropdownOpen = true;
        this.filteredPriorites = [...this.prioriteOptions];
        this.prioriteSearchTerm = '';
      }
    } else if (type === 'statut') {
      if (this.isStatutDropdownOpen) {
        this.isStatutDropdownOpen = false;
      } else {
        this.closeAllDropdowns();
        this.isStatutDropdownOpen = true;
        this.filteredStatuts = [...this.statutOptions];
        this.statutSearchTerm = '';
      }
    } else if (type === 'qualification') {
      if (this.isQualificationDropdownOpen) {
        this.isQualificationDropdownOpen = false;
      } else {
        this.closeAllDropdowns();
        this.isQualificationDropdownOpen = true;
        this.filteredQualifications = [...this.qualificationOptions];
        this.qualificationSearchTerm = '';
      }
    } else if (type === 'projet') {
      if (this.isProjetDropdownOpen) {
        this.isProjetDropdownOpen = false;
      } else {
        this.closeAllDropdowns();
        this.isProjetDropdownOpen = true;
        this.filteredProjets = [...this.projetOptions];
        this.projetSearchTerm = '';
      }
    } else if (type === 'societe') {
      if (this.isSocieteDropdownOpen) {
        this.isSocieteDropdownOpen = false;
      } else {
        this.closeAllDropdowns();
        this.isSocieteDropdownOpen = true;
        this.filteredSocietes = [...this.societeOptions];
        this.societeSearchTerm = '';
      }
    }
  }

  // Méthodes de filtrage
  filterClients(): void {
    const term = this.clientSearchTerm.toLowerCase();
    this.filteredClients = this.clientOptions.filter(c => c.name.toLowerCase().includes(term));
  }
  filterCategories(): void {
    const term = this.categorieSearchTerm.toLowerCase();
    this.filteredCategories = this.categorieOptions.filter(c => c.nom.toLowerCase().includes(term));
  }
  filterPriorites(): void {
    const term = this.prioriteSearchTerm.toLowerCase();
    this.filteredPriorites = this.prioriteOptions.filter(p => p.name.toLowerCase().includes(term));
  }
  filterStatuts(): void {
    const term = this.statutSearchTerm.toLowerCase();
    this.filteredStatuts = this.statutOptions.filter(s => s.name.toLowerCase().includes(term));
  }
  filterQualifications(): void {
    const term = this.qualificationSearchTerm.toLowerCase();
    this.filteredQualifications = this.qualificationOptions.filter(q => q.name.toLowerCase().includes(term));
  }
  filterProjets(): void {
    const term = this.projetSearchTerm.toLowerCase();
    this.filteredProjets = this.projetOptions.filter(p => p.nom.toLowerCase().includes(term));
  }
  filterSocietes(): void {
    const term = this.societeSearchTerm.toLowerCase();
    this.filteredSocietes = this.societeOptions.filter(s => s.nom.toLowerCase().includes(term));
  }

  // Méthodes de sélection
  selectClient(client: any): void {
    this.selectedClient = client;
    this.isClientDropdownOpen = false;
    this.filterForm.patchValue({ client: client.firstName + ' ' + client.lastName });
  }
  selectCategorie(categorie: any): void {
    this.selectedCategorie = categorie;
    this.isCategorieDropdownOpen = false;
    this.filterForm.patchValue({ categorie: categorie.nom });
  }
  selectPriorite(priorite: any): void {
    this.selectedPriorite = priorite;
    this.isPrioriteDropdownOpen = false;
    this.filterForm.patchValue({ priorite: priorite.name });
  }
  selectStatut(statut: any): void {
    this.selectedStatut = statut;
    this.isStatutDropdownOpen = false;
    this.filterForm.patchValue({ statut: statut.name });
  }
  selectQualification(qualification: any): void {
    this.selectedQualification = qualification;
    this.isQualificationDropdownOpen = false;
    this.filterForm.patchValue({ qualification: qualification.name });
  }
  selectProjet(projet: any): void {
    this.selectedProjet = projet;
    this.isProjetDropdownOpen = false;
    this.filterForm.patchValue({ projet: projet.nom });
  }
  selectSociete(societe: any): void {
    this.selectedSociete = societe;
    this.isSocieteDropdownOpen = false;
    this.filterForm.patchValue({ societe: societe.nom });
  }

  onSubmit(): void {
    this.loaderService.showLoader();
    this.applyFilter.emit(this.filterForm.value);
    this.loaderService.hideLoader();
  }

  onReset(): void {
    this.filterForm.reset();
    this.selectedClient = null;
    this.selectedCategorie = null;
    this.selectedPriorite = null;
    this.selectedStatut = null;
    this.selectedQualification = null;
    this.selectedProjet = null;
    this.selectedSociete = null;
    this.applyFilter.emit({});
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // Si le clic n'est PAS dans un élément ayant la classe .custom-select,
    // on ferme tous les dropdowns internes.
    if (!(event.target as HTMLElement).closest('.custom-select')) {
      this.closeAllDropdowns();
    }
  }

  onFilterPanelClick(event: MouseEvent): void {
    // Si le clic ne se produit pas dans un élément ayant la classe .custom-select,
    // on ferme les dropdowns des selects.
    if (!(event.target as HTMLElement).closest('.custom-select')) {
      this.closeAllDropdowns();
    }
  }



  private closeAllDropdowns(): void {
    this.isClientDropdownOpen = false;
    this.isCategorieDropdownOpen = false;
    this.isPrioriteDropdownOpen = false;
    this.isStatutDropdownOpen = false;
    this.isQualificationDropdownOpen = false;
    this.isProjetDropdownOpen = false;
    this.isSocieteDropdownOpen = false;
  }

}
