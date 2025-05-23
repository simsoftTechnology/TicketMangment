import { Component, HostListener, OnInit } from '@angular/core';
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
import { MatDialog } from '@angular/material/dialog';
import { UserSelectorDialogComponent } from '../../user-selector-dialog/user-selector-dialog.component';
import { Pays } from '../../_models/pays';
import { PaysService } from '../../_services/pays.service';
import { OverlayModalService } from '../../_services/overlay-modal.service';
import { AjouterProjetComponent } from '../../Projets/ajouter-projet/ajouter-projet.component';
import { ProjectModalComponent } from '../project-modal/project-modal.component';
import { ConfirmModalComponent } from '../../confirm-modal/confirm-modal.component';
import { LoaderService } from '../../_services/loader.service';
import { GlobalLoaderService } from '../../_services/global-loader.service';

@Component({
    selector: 'app-modifier-societe',
    imports: [ReactiveFormsModule, NgIf, NgFor, FormsModule, CommonModule],
    templateUrl: './modifier-societe.component.html',
    styleUrls: ['./modifier-societe.component.scss']
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
  userPageSize: number = 10;
  userTotalPages: number = 1;
  totalUsers: number = 0;
  userSearchTerm: string = '';
  displayedUsers: User[] = [];
  userJumpPage: number = 1;

  // --- Dropdown Pays ---
  pays: Pays[] = [];
  filteredPays: Pays[] = [];
  paysSearchTerm: string = '';
  isPaysDropdownOpen: boolean = false;

  isLoading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private societeService: SocieteService,
    private paysService: PaysService,
    private contratService: ContratService,
    private projetsService: ProjetService,
    public accountService: AccountService,
    private overlayModalService: OverlayModalService,
    private dialog: MatDialog,
    private router: Router,
    private toastr: ToastrService,
    private loaderService: LoaderService,
    private globalLoaderService: GlobalLoaderService
  ) {
    this.loaderService.isLoading$.subscribe((loading) => {
      this.isLoading = loading;
    });
  }

  ngOnInit(): void {
    // Chargez la liste des pays
    this.loadPays();

    // Initialisez les formulaires
    this.initForms();

    // Écoutez les changements de paramètres de la route
    this.route.params.subscribe(params => {
      this.societeId = +params['id'];
      this.loadSocieteDetails();
    });
  }

  private initForms(): void {
    // Initialisation du formulaire de la société
    this.societeForm = this.fb.group({
      nom: ['', Validators.required],
      adresse: ['', Validators.required],
      telephone: ['', [Validators.required, Validators.pattern('^\\+?[0-9\\-\\s]+$')]],
      paysId: [null, Validators.required] 
    });

    // Initialisation du formulaire du contrat
    this.contratForm = this.fb.group({
      id: [0],
      dateDebut: ['', Validators.required],
      dateFin: ['', Validators.required],
      type: ['Standard', Validators.required],
      typeContrat: ['Client-Societe', Validators.required]
    });
  }

  private loadSocieteDetails(): void {
    // Active le loader global
    this.globalLoaderService.showGlobalLoader();
  
    this.societeService.getSocieteDetails(this.societeId).subscribe(
      (details: Societe) => {
        this.societeDetails = details;
        // Mettez à jour vos formulaires avec les valeurs récupérées
        this.societeForm.patchValue({
          nom: details.nom,
          adresse: details.adresse,
          telephone: details.telephone,
          paysId: details.paysId 
        });
        if (details.contrat) {
          this.contratForm.patchValue({
            id: details.contrat.id,
            dateDebut: details.contrat.dateDebut
              ? new Date(details.contrat.dateDebut + 'Z').toISOString().substring(0, 10)
              : '',
            dateFin: details.contrat.dateFin
              ? new Date(details.contrat.dateFin + 'Z').toISOString().substring(0, 10)
              : '',
            type: details.contrat.type,
            typeContrat: details.contrat.typeContrat
          });
        }
        // Chargement des projets et utilisateurs associés
        this.loadProjects();
        this.loadSocieteUsers();
      },
      error => {
        console.error('Erreur lors de la récupération des détails', error);
        this.toastr.error('Erreur lors de la récupération des détails');
      },
      () => {
        // Masque le loader global lorsque l'opération est terminée
        this.globalLoaderService.hideGlobalLoader();
      }
    );
  }
  

  onSubmit(): void {
    if (!this.societeForm.dirty) {
      this.toastr.warning("Veuillez modifier au moins un champ.");
      return;
    }
    if (this.societeForm.valid) {
      const modalInstance = this.overlayModalService.open(ConfirmModalComponent);
      modalInstance.message = "Confirmez-vous la modification de la société ?";
      
      modalInstance.confirmed.subscribe(() => {
        const updatedSociete: Societe = {
          ...this.societeDetails,
          ...this.societeForm.value
        };


        updatedSociete.nom= this.accountService.removeSpecial(updatedSociete.nom)
        updatedSociete.adresse= this.accountService.removeSpecial(updatedSociete.adresse)
        
        // Active le loader avant l'appel
        this.loaderService.showLoader();
        this.societeService.updateSociete(this.societeDetails.id, updatedSociete).subscribe({
          next: () => {
            this.toastr.success("Société modifiée avec succès");
            this.loaderService.hideLoader();
          },
          error: error => {
            console.error('Erreur lors de la mise à jour de la société', error);
            this.toastr.error("Erreur lors de la mise à jour de la société");
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

    
  onSubmitContrat(): void {
    if (this.contratForm.valid) {
      const contractData: Contrat = {
        ...this.contratForm.value,
        societePartenaireId: this.societeDetails.id
      };
  
      if (contractData.id && contractData.id > 0) {
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
      this.loadSocieteUsers();
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
  
  loadProjects(): void {
    this.projetsService.getPaginatedProjets(
        this.pageNumber,
        this.pageSize,
        this.projectSearchTerm,
        this.societeDetails.id
      )
      .subscribe((result: PaginatedResult<Projet[]>) => {
        this.displayedProjects = result.items || [];
        if (result.pagination) {
          this.totalProjects = result.pagination.totalItems;
          this.totalPages = result.pagination.totalPages;
        } else {
          this.totalProjects = this.displayedProjects.length;
          this.totalPages = Math.ceil(this.totalProjects / this.pageSize);
        }
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

  loadSocieteUsers(): void {
    this.societeService
      .getSocieteUsersPaged(
        this.societeDetails.id,
        this.userPageNumber,
        this.userPageSize,
        this.userSearchTerm
      )
      .subscribe(
        (result: PaginatedResult<User[]>) => {
          this.displayedUsers = result.items || [];
          if (result.pagination) {
            this.totalUsers = result.pagination.totalItems;
            this.userTotalPages = result.pagination.totalPages;
          } else {
            this.totalUsers = this.displayedUsers.length;
            this.userTotalPages = Math.ceil(this.totalUsers / this.userPageSize);
          }
        },
        error => {
          console.error("Erreur lors du chargement des utilisateurs paginés", error);
          this.toastr.error("Erreur lors du chargement des membres de la société");
        }
      );
  }
  
  onUserPageChange(newPage: number): void {
    this.userPageNumber = Math.min(Math.max(newPage, 1), this.userTotalPages);
    this.userJumpPage = this.userPageNumber;
    this.loadSocieteUsers();
  }

  jumpToUserPage(): void {
    if (this.userJumpPage >= 1 && this.userJumpPage <= this.userTotalPages) {
      this.userPageNumber = this.userJumpPage;
      this.loadSocieteUsers();
    }
  }

  onUserSearch(): void {
    this.userPageNumber = 1;
    this.userJumpPage = 1;
    this.loadSocieteUsers();
  }

  viewProjet(projetId: number): void {
    this.router.navigate(['/home/projets/details', projetId]);
  }

  range(start: number, end: number): number[] {
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  openAttachUserDialog(): void {
    this.accountService.getAllUsers().subscribe({
      next: (allUsers: User[]) => {
        const dialogRef = this.dialog.open(UserSelectorDialogComponent, {
          data: { availableUsers: allUsers.filter((res)=>{return res.role =="Client"  && res.societeId== null}) }
        });
        
        dialogRef.afterClosed().subscribe((selectedUser: User) => {
          if (selectedUser) {
            this.attachUser(selectedUser.id);
          }
        });
      },
      error: error => {
        console.error("Erreur lors de la récupération des utilisateurs", error);
        this.toastr.error("Erreur lors de la récupération des utilisateurs");
      }
    });
  }
  
  attachUser(userId: number): void {
    this.loaderService.showLoader();
    this.societeService.attachUser(this.societeDetails.id, userId).subscribe({
      next: (result: boolean) => {
        if (result) {
          this.toastr.success("Utilisateur attaché avec succès");
          this.loadSocieteUsers();
        } else {
          this.toastr.error("L'utilisateur est déjà associé à cette société");
        }
        this.loaderService.hideLoader();
      },
      error: error => {
        console.error("Erreur lors de l'attachement de l'utilisateur", error);
        this.toastr.error("Erreur lors de l'attachement de l'utilisateur");
        this.loaderService.hideLoader();
      }
    });
  }


  detachUser(user: User): void {
    const confirmationMessage = `Êtes-vous sûr de vouloir détacher ${user.firstName} ${user.lastName} de ${this.societeDetails.nom} ?`;
    const modalInstance = this.overlayModalService.open(ConfirmModalComponent);
    modalInstance.message = confirmationMessage;
    
    modalInstance.confirmed.subscribe(() => {
      this.societeService.detachUser(this.societeDetails.id, user.id).subscribe({
        next: () => {
          this.toastr.success("Utilisateur détaché avec succès");
          this.loadSocieteUsers();
        },
        error: error => {
          console.error("Erreur lors du détachement de l'utilisateur", error);
          this.toastr.error("Erreur lors du détachement de l'utilisateur");
        }
      });
      this.overlayModalService.close();
    });
    
    modalInstance.cancelled.subscribe(() => {
      this.overlayModalService.close();
    });
  }
  
  toggleDropdown(type: string): void {
    if (type === 'pays') {
      this.isPaysDropdownOpen = !this.isPaysDropdownOpen;
    } 
  }
  
  getPaysName(idPays: number): string {
    return this.pays.find(p => p.idPays === idPays)?.nom || '';
  }  

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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-select')) {
      this.isPaysDropdownOpen = false;
    }
  }

  updatePays(idPays: number): void {
    const control = this.societeForm.get('paysId');
    control?.setValue(idPays);
    control?.markAsDirty();
    this.isPaysDropdownOpen = false;
  }

  openProjectModal(): void {
    const modalInstance = this.overlayModalService.open(ProjectModalComponent);
    modalInstance.societeId = this.societeDetails.id;
    
    if (modalInstance.closed) {
      modalInstance.closed.subscribe((result: any) => {
        if (result && result.projectCreated) {
          this.loadProjects();
        }
      });
    }
  }
}
