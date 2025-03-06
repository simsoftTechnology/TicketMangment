import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { Ticket } from '../../_models/ticket';
import { User } from '../../_models/user';
import { TicketUpdateDto } from '../../_models/ticketUpdateDto';
import { TicketService } from '../../_services/ticket.service';
import { AccountService } from '../../_services/account.service';
import { ProjetService } from '../../_services/projet.service';
import { CategorieProblemeService } from '../../_services/categorie-probleme.service';
import { QualificationService } from '../../_services/qualification.service';
import { StatusService } from '../../_services/status.service';
import { PrioriteService } from '../../_services/priorite.service';

@Component({
  selector: 'app-ticket-details',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FormsModule],
  templateUrl: './ticket-details.component.html',
  styleUrls: ['./ticket-details.component.css']
})
export class TicketDetailsComponent implements OnInit {
  ticket: Ticket | null = null;
  currentUser: User | null = null;
  projets: any[] = [];
  categories: any[] = [];

  // Listes chargées depuis les services
  qualifications: { id: number, name: string }[] = [];
  priorities: { id: number, name: string }[] = [];
  statuses: { id: number, name: string }[] = [];

  editTicketForm!: FormGroup;
  selectedFile: File | null = null;
  editMode: boolean = false;
  editDevMode: boolean = false;
  editStatusMode: boolean = false;
  isLoading: boolean = false;
  showAcceptForm: boolean = false;
  showRejectForm: boolean = false;
  selectedDevId: number | null = null;
  rejectionForm: FormGroup;
  developers: User[] = [];
  developerRejectFormVisible: boolean = false;
  selectedNewDevId: number | null = null;
  developerRejectionForm: FormGroup;

  constructor(
    private ticketService: TicketService,
    private accountService: AccountService,
    private projetService: ProjetService,
    private categorieProblemeService: CategorieProblemeService,
    private qualificationService: QualificationService,
    private priorityService: PrioriteService,
    private statusService: StatusService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.rejectionForm = this.fb.group({
      reason: ['', Validators.required]
    });
    this.developerRejectionForm = this.fb.group({
      reason: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.currentUser = this.accountService.currentUser();
    const ticketId = Number(this.route.snapshot.paramMap.get('id'));
    if (ticketId) {
      this.loadTicket(ticketId);
    }
    this.loadProjets();
    this.loadCategories();
    this.loadQualifications();
    this.loadPriorities();
    this.loadStatuses();

    if (this.currentUser && (this.isAdminOrChef() || this.currentUser.role.toLowerCase() === 'collaborateur')) {
      this.loadDevelopers();
    }
  }

  loadTicket(id: number): void {
    this.ticketService.getTicket(id).subscribe({
      next: (ticket) => {
        ticket.createdAt = new Date(ticket.createdAt);
        if (ticket.updatedAt) {
          ticket.updatedAt = new Date(ticket.updatedAt);
        }
        this.ticket = ticket;
        this.initializeEditForm();
      },
      error: (error) => {
        console.error('Erreur lors du chargement du ticket', error);
      }
    });
  }

  loadProjets(): void {
    this.projetService.getProjets().subscribe({
      next: (projets) => {
        this.projets = projets;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des projets', err);
      }
    });
  }

  loadCategories(): void {
    this.categorieProblemeService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des catégories', err);
      }
    });
  }

  loadQualifications(): void {
    this.qualificationService.getQualifications().subscribe({
      next: (qualifications) => {
        this.qualifications = qualifications;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des qualifications', err);
      }
    });
  }

  loadPriorities(): void {
    this.priorityService.getPriorites().subscribe({
      next: (priorities) => {
        this.priorities = priorities;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des priorités', err);
      }
    });
  }

  loadStatuses(): void {
    this.statusService.getStatuses().subscribe({
      next: (statuses) => {
        this.statuses = statuses;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des statuts', err);
      }
    });
  }

  loadDevelopers(): void {
    this.accountService.getAllUsers().subscribe({
      next: (users: User[]) => {
        this.developers = users.filter(u => u.role.toLowerCase() === 'collaborateur');
      },
      error: (error) => {
        console.error('Erreur lors du chargement des développeurs', error);
      }
    });
  }

  initializeEditForm(): void {
    if (!this.ticket) { return; }
    const formControls: any = {
      title: [this.ticket.title, Validators.required],
      description: [this.ticket.description, Validators.required],
      qualificationId: [this.ticket.qualificationId, Validators.required],
      projetId: [this.ticket.projet?.id, Validators.required],
      problemCategoryId: [this.ticket.problemCategory?.id, Validators.required],
      priorityId: [this.ticket.priorityId, Validators.required]
    };
    if (this.currentUser?.role.toLowerCase() === 'collaborateur') {
      formControls['statutId'] = [this.ticket.statutId, Validators.required];
    }
    if (this.isAdminOrChef()) {
      formControls['responsibleId'] = [this.ticket.responsible?.id];
    }
    this.editTicketForm = this.fb.group(formControls);
  }

  onFileSelected(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  getPriorityClass(priorityId: number): string {
    // Mapping basé sur l'id de la priorité
    switch (priorityId) {
      case 1: return 'priority-urgent';
      case 2: return 'priority-eleve';
      case 3: return 'priority-moyen';
      case 4: return 'priority-faible';
      default: return '';
    }
  }

  getStatusClass(statusId: number): string {
    switch (statusId) {
      case 1: return 'status-non-ouvert';
      case 2: return 'status-accepte';
      case 3: return 'status-refuse';
      case 4: return 'status-en-cours';
      case 5: return 'status-resolu';
      default: return '';
    }
  }

  getPriorityLabel(priorityId: number): string {
    const found = this.priorities.find(p => p.id === priorityId);
    return found ? found.name : '';
  }

  getStatusLabel(statutId: number): string {
    const found = this.statuses.find(s => s.id === statutId);
    return found ? found.name : '';
  }
  

  getQualificationLabel(qualificationId: number): string {
    const found = this.qualifications.find(q => q.id === qualificationId);
    return found ? found.name : '';
  }

  enableEditMode(): void {
    if (this.currentUser?.role.toLowerCase() === 'client') {
      this.editMode = true;
    }
  }

  enableEditDevMode(): void {
    if (this.isAdminOrChef()) {
      this.editDevMode = true;
    }
  }

  enableEditStatusMode(): void {
    if (this.currentUser?.role.toLowerCase() === 'collaborateur') {
      this.editStatusMode = true;
    }
  }

  cancelEdit(): void {
    this.editMode = false;
    if (this.ticket) {
      this.loadTicket(this.ticket.id);
    }
  }

  cancelEditDevMode(): void {
    this.editDevMode = false;
    if (this.ticket) {
      this.loadTicket(this.ticket.id);
    }
  }

  cancelEditStatusMode(): void {
    this.editStatusMode = false;
    if (this.ticket) {
      this.loadTicket(this.ticket.id);
    }
  }

  saveTicket(): void {
    if (!this.ticket) { return; }

    if (this.currentUser?.role.toLowerCase() === 'client') {
      if (this.editTicketForm.invalid) {
        this.editTicketForm.markAllAsTouched();
        return;
      }
      this.isLoading = true;
      const baseUpdatedTicket: TicketUpdateDto = {
        id: this.ticket.id,
        title: this.editTicketForm.value.title,
        description: this.editTicketForm.value.description,
        priorityId: this.editTicketForm.value.priorityId,
        qualificationId: this.editTicketForm.value.qualificationId,
        projetId: this.editTicketForm.value.projetId,
        problemCategoryId: this.editTicketForm.value.problemCategoryId,
        statutId: this.ticket.statutId
      };

      if (this.selectedFile) {
        const formData = new FormData();
        formData.append('file', this.selectedFile, this.selectedFile.name);
        this.ticketService.uploadAttachment(formData).pipe(
          switchMap((uploadResult: { secureUrl: string }) => {
            const updatedTicket: TicketUpdateDto = {
              ...baseUpdatedTicket,
              attachments: uploadResult.secureUrl
            };
            return this.ticketService.updateTicket(this.ticket!.id, updatedTicket);
          })
        ).subscribe({
          next: () => {
            alert('Ticket mis à jour avec succès.');
            this.editMode = false;
            this.loadTicket(this.ticket!.id);
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Erreur lors de la mise à jour du ticket', error);
            alert('Une erreur est survenue lors de la mise à jour du ticket.');
            this.isLoading = false;
          }
        });
      } else {
        this.ticketService.updateTicket(this.ticket.id, baseUpdatedTicket).subscribe({
          next: () => {
            alert('Ticket mis à jour avec succès.');
            this.editMode = false;
            this.loadTicket(this.ticket!.id);
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Erreur lors de la mise à jour du ticket', error);
            alert('Une erreur est survenue lors de la mise à jour du ticket.');
            this.isLoading = false;
          }
        });
      }
    } else if (this.isAdminOrChef() && this.editDevMode) {
      if (!this.editTicketForm.value.responsibleId) {
        alert('Veuillez sélectionner un développeur.');
        return;
      }
      const updatedTicket: TicketUpdateDto = {
        id: this.ticket.id,
        title: this.ticket.title,
        description: this.ticket.description,
        priorityId: this.ticket.priorityId,
        qualificationId: this.ticket.qualificationId,
        projetId: this.ticket.projet!.id,
        problemCategoryId: this.ticket.problemCategory!.id,
        statutId: this.ticket.statutId,
        responsibleId: this.editTicketForm.value.responsibleId
      };
      this.ticketService.updateTicket(this.ticket.id, updatedTicket).subscribe({
        next: () => {
          alert('Développeur assigné modifié avec succès.');
          this.editDevMode = false;
          this.loadTicket(this.ticket!.id);
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour du développeur assigné', error);
          alert('Une erreur est survenue lors de la mise à jour.');
        }
      });
    } else if (this.currentUser?.role.toLowerCase() === 'collaborateur' && this.editStatusMode) {
      if (!this.editTicketForm.value.statutId) {
        alert('Veuillez sélectionner un statut.');
        return;
      }
      const updatedTicket: TicketUpdateDto = {
        id: this.ticket.id,
        title: this.ticket.title,
        description: this.ticket.description,
        priorityId: this.ticket.priorityId,
        qualificationId: this.ticket.qualificationId,
        projetId: this.ticket.projet!.id,
        problemCategoryId: this.ticket.problemCategory!.id,
        statutId: this.editTicketForm.value.statutId
      };
      this.ticketService.updateTicket(this.ticket.id, updatedTicket).subscribe({
        next: () => {
          alert('Statut modifié avec succès.');
          this.editStatusMode = false;
          this.loadTicket(this.ticket!.id);
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour du statut', error);
          alert('Une erreur est survenue lors de la mise à jour.');
        }
      });
    }
  }

  isAdminOrChef(): boolean {
    if (!this.currentUser) { return false; }
    const role = this.currentUser.role.toLowerCase();
    return role === 'super admin' || role === 'chef de projet';
  }

  shouldShowClientAndDev(): boolean {
    return this.currentUser ? this.currentUser.role.toLowerCase() !== 'client' : false;
  }

  isActionable(): boolean {
    if (!this.ticket || !this.currentUser) { return false; }
    const role = this.currentUser.role.toLowerCase();
    // Exemple : actionnable si le statut est "Non ouvert" (statusId = 1) pour Super Admin / Chef de projet
    return (role === 'super admin' || role === 'chef de projet') && this.ticket.statutId === 5;
  }

  showAccept(): void {
    this.showAcceptForm = true;
    this.showRejectForm = false;
  }

  showReject(): void {
    this.showRejectForm = true;
    this.showAcceptForm = false;
  }

  cancelAccept(): void {
    this.showAcceptForm = false;
    this.selectedDevId = null;
  }

  cancelReject(): void {
    this.showRejectForm = false;
    this.rejectionForm.reset();
  }

  acceptTicket(): void {
    if (!this.ticket || !this.selectedDevId) { return; }
    
    const updatedTicket: TicketUpdateDto = {
      id: this.ticket.id,
      title: this.ticket.title,
      description: this.ticket.description,
      priorityId: this.ticket.priorityId,
      qualificationId: this.ticket.qualificationId,
      projetId: this.ticket.projet!.id,
      problemCategoryId: this.ticket.problemCategory!.id,
      statutId: 2, // Accepté
      responsibleId: this.selectedDevId
    };

    this.ticketService.updateTicket(this.ticket.id, updatedTicket).subscribe({
      next: () => {
        alert('Ticket accepté et développeur assigné.');
        this.loadTicket(this.ticket!.id);
        this.showAcceptForm = false;
      },
      error: (error) => {
        console.error('Erreur lors de l\'acceptation du ticket', error);
        alert('Une erreur est survenue lors de l\'acceptation du ticket.');
      }
    });
  }

  rejectTicket(): void {
    if (!this.ticket) { return; }
    
    const updatedTicket: TicketUpdateDto = {
      id: this.ticket.id,
      title: this.ticket.title,
      description: this.ticket.description,
      priorityId: this.ticket.priorityId,
      qualificationId: this.ticket.qualificationId,
      projetId: this.ticket.projet!.id,
      problemCategoryId: this.ticket.problemCategory!.id,
      statutId: 3, // Refusé
      reasonRejection: this.rejectionForm.value.reason
    };

    this.ticketService.updateTicket(this.ticket.id, updatedTicket).subscribe({
      next: () => {
        alert('Ticket rejeté.');
        this.loadTicket(this.ticket!.id);
        this.showRejectForm = false;
      },
      error: (error) => {
        console.error('Erreur lors du rejet du ticket', error);
        alert('Une erreur est survenue lors du rejet du ticket.');
      }
    });
  }

  developerAccept(): void {
    if (!this.ticket) { return; }
    
    const updatedTicket: TicketUpdateDto = {
      id: this.ticket.id,
      title: this.ticket.title,
      description: this.ticket.description,
      priorityId: this.ticket.priorityId,
      qualificationId: this.ticket.qualificationId,
      projetId: this.ticket.projet!.id,
      problemCategoryId: this.ticket.problemCategory!.id,
      statutId: 4 // En cours
    };

    this.ticketService.updateTicket(this.ticket.id, updatedTicket).subscribe({
      next: () => {
        alert('Ticket maintenant en cours de traitement.');
        this.loadTicket(this.ticket!.id);
      },
      error: (error) => {
        console.error('Erreur lors de l\'acceptation', error);
        alert('Erreur lors de l\'acceptation du ticket.');
      }
    });
  }

  openDeveloperRejectForm(): void {
    this.developerRejectFormVisible = true;
  }

  cancelDeveloperReject(): void {
    this.developerRejectFormVisible = false;
    this.selectedNewDevId = null;
    this.developerRejectionForm.reset();
  }

  developerReject(): void {
    if (!this.ticket || !this.selectedNewDevId) { return; }

    const updatedTicket: TicketUpdateDto = {
      id: this.ticket.id,
      title: this.ticket.title,
      description: this.ticket.description,
      priorityId: this.ticket.priorityId,
      qualificationId: this.ticket.qualificationId,
      projetId: this.ticket.projet!.id,
      problemCategoryId: this.ticket.problemCategory!.id,
      statutId: 2, // Replacer à « Accepté »
      responsibleId: this.selectedNewDevId,
      reasonRejection: this.developerRejectionForm.value.reason
    };

    this.ticketService.updateTicket(this.ticket.id, updatedTicket).subscribe({
      next: () => {
        alert('Ticket réassigné à un autre développeur.');
        this.loadTicket(this.ticket!.id);
        this.cancelDeveloperReject();
      },
      error: (error) => {
        console.error('Erreur lors de la réassignation', error);
        alert('Erreur lors de la réassignation du ticket.');
      }
    });
  }
}
