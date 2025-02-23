import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SocieteService } from '../../_services/societe.service';
import { ContratService } from '../../_services/contrat.service';
import { ToastrService } from 'ngx-toastr';
import { Societe } from '../../_models/societe';
import { Contrat } from '../../_models/contrat';
import { ProjetService } from '../../_services/projet.service';
import { AccountService } from '../../_services/account.service';
import { PaginatedResult } from '../../_models/pagination';
import { User } from '../../_models/user';
import { Projet } from '../../_models/Projet';
import { CommonModule, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-modifier-societe',
  standalone: true,
  imports: [ ReactiveFormsModule, NgIf, NgFor, FormsModule, CommonModule],
  templateUrl: './modifier-societe.component.html',
  styleUrls: ['./modifier-societe.component.css']
})
export class ModifierSocieteComponent implements OnInit {
  societeForm!: FormGroup;
  contratForm!: FormGroup;
  societeId!: number;
  societeDetails!: Societe;

  activeTab: string = 'utilisateurs';

  // ----- Pagination & recherche pour les PROJETS -----
  pageNumber: number = 1;
  pageSize: number = 1;
  totalPages: number = 1;
  totalProjects: number = 0;
  projectSearchTerm: string = '';
  displayedProjects: Projet[] = [];
  jumpPage: number = 1;

  // ----- Pagination & recherche pour les UTILISATEURS -----
  userPageNumber: number = 1;
  userPageSize: number = 1;
  userTotalPages: number = 1;
  totalUsers: number = 0;
  userSearchTerm: string = '';
  displayedUsers: User[] = [];
  userJumpPage: number = 1;



  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private societeService: SocieteService,
    private contratService: ContratService,
    private projetsService: ProjetService,
    private accountService: AccountService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.societeId = +this.route.snapshot.paramMap.get('id')!;

    // Initialisation du formulaire de la société
    this.societeForm = this.fb.group({
      nom: ['', Validators.required],
      adresse: ['', Validators.required],
      telephone: ['', [Validators.required, Validators.pattern('^\\+?[0-9\\-\\s]+$')]]
    });

    // Initialisation du formulaire du contrat
    this.contratForm = this.fb.group({
      id: [0],
      dateDebut: ['', Validators.required],
      dateFin: ['', Validators.required],
      type: ['Standard', Validators.required],
      typeContrat: ['Client-Societe', Validators.required]
    });

    // Récupération des détails de la société, incluant éventuellement le contrat
    this.societeService.getSocieteDetails(this.societeId).subscribe(
      (details: Societe) => {
        this.societeDetails = details;
        // Mise à jour du formulaire de la société
        this.societeForm.patchValue({
          nom: details.nom,
          adresse: details.adresse,
          telephone: details.telephone
        });
        // Mise à jour du formulaire du contrat si celui-ci existe
        if (details.contrat) {
          this.contratForm.patchValue({
            id: details.contrat.id,
            dateDebut: details.contrat.dateDebut 
              ? new Date(details.contrat.dateDebut+ 'Z').toISOString().substring(0, 10)
              : '',
            dateFin: details.contrat.dateFin 
              ? new Date(details.contrat.dateFin+ 'Z').toISOString().substring(0, 10)
              : '',
            type: details.contrat.type,
            typeContrat: details.contrat.typeContrat
          });
        }
              
        
        
        // Chargement des projets et utilisateurs
        this.loadProjects();
        this.loadUsers();
      },
      error => { console.error('Erreur lors de la récupération des détails', error); }
    );
    
  }

  onSubmit(): void {
    if (!this.societeForm.dirty) {
      this.toastr.warning("Veuillez modifier au moins un champ.");
      return;
    }
    if (this.societeForm.valid) {
      const updatedSociete: Societe = {
        ...this.societeDetails,
        ...this.societeForm.value
      };
      this.societeService.updateSociete(this.societeDetails.id, updatedSociete).subscribe({
        next: () => {
          this.toastr.success("Société modifiée avec succès");
        },
        error: error => {
          console.error('Erreur lors de la mise à jour de la société', error);
          this.toastr.error("Erreur lors de la mise à jour de la société");
        }
      });
    }
  }

  onSubmitContrat(): void {
    if (this.contratForm.valid) {
      // Ajout du champ societePartenaireId si nécessaire
      const contractData: Contrat = {
        ...this.contratForm.value,
        societePartenaireId: this.societeDetails.id
      };
  
      if (contractData.id && contractData.id > 0) {
        // Mise à jour du contrat existant
        this.contratService.updateContract(contractData.id, contractData).subscribe({
          next: () => {
            this.toastr.success("Contrat mis à jour avec succès");
            this.societeDetails.contrat = { ...contractData };
          },
          error: error => {
            console.error("Erreur lors de la mise à jour du contrat", error);
            this.toastr.error("Erreur lors de la mise à jour du contrat");
          }
        });
      } else {
        // Création d'un nouveau contrat
        this.contratService.addContract(contractData).subscribe({
          next: (newContract: Contrat) => {
            this.toastr.success("Contrat créé avec succès");
            this.societeDetails.contrat = newContract;
          },
          error: error => {
            console.error("Erreur lors de la création du contrat", error);
            this.toastr.error("Erreur lors de la création du contrat");
          }
        });
      }
    } else {
      this.toastr.warning("Veuillez remplir correctement le formulaire de contrat.");
    }
  }
  
  

  cancelContrat(): void {
    if (this.societeDetails.contrat) {
      this.contratForm.patchValue({
        id: this.societeDetails.contrat.id,
        dateDebut: this.societeDetails.contrat.dateDebut
          ? new Date(this.societeDetails.contrat.dateDebut).toISOString().substring(0, 10)
          : '',
        dateFin: this.societeDetails.contrat.dateFin
          ? new Date(this.societeDetails.contrat.dateFin).toISOString().substring(0, 10)
          : '',
        type: this.societeDetails.contrat.type,
        typeContrat: this.societeDetails.contrat.typeContrat
      });
    } else {
      this.contratForm.reset({
        id: 0,
        dateDebut: '',
        dateFin: '',
        type: 'Standard',
        typeContrat: 'Client-Societe'
      });
    }
    this.contratForm.markAsPristine();
  }
  
  

  onCancel(): void {
    this.societeForm.patchValue({
      nom: this.societeDetails.nom,
      adresse: this.societeDetails.adresse,
      telephone: this.societeDetails.telephone
    });
    if (this.societeDetails.contrat) {
      this.contratForm.patchValue({
        id: this.societeDetails.contrat.id,
        dateDebut: this.societeDetails.contrat.dateDebut
          ? new Date(this.societeDetails.contrat.dateDebut).toISOString().substring(0, 10)
          : '',
        dateFin: this.societeDetails.contrat.dateFin
          ? new Date(this.societeDetails.contrat.dateFin).toISOString().substring(0, 10)
          : '',
        type: this.societeDetails.contrat.type,
        typeContrat: this.societeDetails.contrat.typeContrat
      });
    }
    this.societeForm.markAsPristine();
    this.contratForm.markAsPristine();
  }
  

  switchTab(tab: string): void {
    this.activeTab = tab;
    if (tab === 'projets') {
      this.pageNumber = 1;
      this.jumpPage = 1;
      this.loadProjects();
    } else if (tab === 'utilisateurs') {
      this.userPageNumber = 1;
      this.userJumpPage = 1;
      this.loadUsers();
    }
  }

  initializeContratForm(): void {
    this.contratForm.reset({
      id: 0,
      dateDebut: '',
      dateFin: '',
      type: 'Standard',
      typeContrat: 'Client-Societe'
    });
  }
  

  // Fonctions de pagination pour les projets et utilisateurs
  loadProjects(): void {
    this.projetsService.getPaginatedProjets(this.pageNumber, this.pageSize, this.projectSearchTerm)
      .subscribe((result: PaginatedResult<Projet[]>) => {
        // Filtrer uniquement les projets qui appartiennent à la société en cours
        this.displayedProjects = (result.items ?? []).filter(projet => projet.societeId === this.societeDetails.id);
        // Pour la pagination, il faudra ajuster le total si besoin
        this.totalProjects = this.displayedProjects.length;
        this.totalPages = Math.ceil(this.totalProjects / this.pageSize);
      }, error => {
        console.error('Erreur lors du chargement des projets paginés', error);
      });
  }
  


  onPageChange(newPage: number): void {
    this.pageNumber = Math.min(Math.max(newPage, 1), this.totalPages);
    this.jumpPage = this.pageNumber;
    this.loadProjects();
  }

  jumpToPage(): void {
    if (this.jumpPage >= 1 && this.jumpPage <= this.totalPages) {
      this.pageNumber = this.jumpPage;
      this.loadProjects();
    }
  }

  onProjectSearch(): void {
    this.pageNumber = 1;
    this.jumpPage = 1;
    this.loadProjects();
  }

  loadUsers(): void {
    this.accountService.getUsers(this.userPageNumber, this.userPageSize, this.userSearchTerm)
      .subscribe((result: PaginatedResult<User[]>) => {
        const allUsers = result.items ?? [];
        // Filtrer uniquement les utilisateurs dont le societeId correspond à la société courante
        this.displayedUsers = allUsers.filter(user => user.societeId === this.societeDetails.id);
        // Mettre à jour la pagination en fonction du nombre d'utilisateurs filtrés
        this.totalUsers = this.displayedUsers.length;
        this.userTotalPages = Math.ceil(this.totalUsers / this.userPageSize);
      }, error => {
        console.error('Erreur lors du chargement des utilisateurs paginés', error);
      });
  }
  

  onUserPageChange(newPage: number): void {
    this.userPageNumber = Math.min(Math.max(newPage, 1), this.userTotalPages);
    this.userJumpPage = this.userPageNumber;
    this.loadUsers();
  }

  jumpToUserPage(): void {
    if (this.userJumpPage >= 1 && this.userJumpPage <= this.userTotalPages) {
      this.userPageNumber = this.userJumpPage;
      this.loadUsers();
    }
  }

  onUserSearch(): void {
    this.userPageNumber = 1;
    this.userJumpPage = 1;
    this.loadUsers();
  }

  viewProjet(projetId: number): void {
    this.router.navigate(['/home/projets/details', projetId]);
  }

  range(start: number, end: number): number[] {
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }
}
