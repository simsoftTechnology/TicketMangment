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
  qualificationOptions: string[] = ['Ticket Support', 'Demande de formation', "Demande d'information"];
  prioriteOptions: string[] = ['Urgent', 'élevé', 'moyen', 'faible'];
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

    if (this.currentUser && (this.isAdminOrChef() || this.currentUser.role.toLowerCase() === 'développeur')) {
      this.loadDevelopers();
    }
  }

  loadTicket(id: number): void {
    this.ticketService.getTicket(id).subscribe({
      next: (ticket) => {
        ticket.dateCreation = new Date(ticket.dateCreation);
        if (ticket.dateModification) {
          ticket.dateModification = new Date(ticket.dateModification);
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

  loadDevelopers(): void {
    this.accountService.getAllUsers().subscribe({
      next: (users: User[]) => {
        this.developers = users.filter(u => u.role.toLowerCase() === 'développeur');
      },
      error: (error) => {
        console.error('Erreur lors du chargement des développeurs', error);
      }
    });
  }

  initializeEditForm(): void {
    if (!this.ticket) { return; }
    const formControls: any = {
      qualification: [this.ticket.qualification, Validators.required],
      projetId: [this.ticket.projet?.id, Validators.required],
      categorieProblemeId: [this.ticket.categorieProbleme?.id, Validators.required],
      priorite: [this.ticket.priorite, Validators.required],
      titre: [this.ticket.titre, Validators.required],
      description: [this.ticket.description, Validators.required],
      developpeurId: [this.ticket.developpeur?.id]
    };
    if (this.currentUser?.role.toLowerCase() === 'développeur') {
      formControls['statuts'] = [this.ticket.statuts, Validators.required];
    }
    this.editTicketForm = this.fb.group(formControls);
  }

  onFileSelected(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  getPriorityClass(priority: string): string {
    if (!priority) return '';
    switch (priority.toLowerCase()) {
      case 'urgent': return 'priority-urgent';
      case 'élevé': return 'priority-eleve';
      case 'moyen': return 'priority-moyen';
      case 'faible': return 'priority-faible';
      default: return '';
    }
  }

  getStatusClass(status: string): string {
    if (!status) return '';
    switch (status.toLowerCase()) {
      case 'non ouvert': return 'status-non-ouvert';
      case 'accepté': return 'status-accepte';
      case 'refusé': return 'status-refuse';
      case 'en cours': return 'status-en-cours';
      case 'résolu': return 'status-resolu';
      default: return '';
    }
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
    if (this.currentUser?.role.toLowerCase() === 'développeur') {
      this.editStatusMode = true;
    }
  }

  cancelEdit(): void {
    this.editMode = false;
    this.loadTicket(this.ticket!.id);
  }

  cancelEditDevMode(): void {
    this.editDevMode = false;
    this.loadTicket(this.ticket!.id);
  }

  cancelEditStatusMode(): void {
    this.editStatusMode = false;
    this.loadTicket(this.ticket!.id);
  }

  saveTicket(): void {
    if (!this.ticket) return;

    if (this.currentUser?.role.toLowerCase() === 'client') {
      if (this.editTicketForm.invalid) {
        this.editTicketForm.markAllAsTouched();
        return;
      }
      this.isLoading = true;
      const baseUpdatedTicket: TicketUpdateDto = {
        id: this.ticket.id,
        titre: this.editTicketForm.value.titre,
        description: this.editTicketForm.value.description,
        priorite: this.editTicketForm.value.priorite,
        qualification: this.editTicketForm.value.qualification,
        projetId: this.ticket.projet!.id,
        categorieProblemeId: this.ticket.categorieProbleme!.id,
        statuts: this.ticket.statuts
      };
      
      if (this.selectedFile) {
        const formData = new FormData();
        formData.append('file', this.selectedFile, this.selectedFile.name);
        this.ticketService.uploadAttachment(formData).pipe(
          switchMap((uploadResult: { secureUrl: string }) => {
            const updatedTicket: TicketUpdateDto = {
              ...baseUpdatedTicket,
              attachement: uploadResult.secureUrl
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
        this.ticketService.updateTicket(this.ticket!.id, baseUpdatedTicket).subscribe({
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
    }
    else if (this.isAdminOrChef() && this.editDevMode) {
      if (!this.editTicketForm.value.developpeurId) {
        alert('Veuillez sélectionner un développeur.');
        return;
      }
      const updatedTicket: TicketUpdateDto = {
        id: this.ticket.id,
        titre: this.ticket.titre,
        description: this.ticket.description,
        priorite: this.ticket.priorite,
        qualification: this.ticket.qualification,
        projetId: this.ticket.projet!.id,
        categorieProblemeId: this.ticket.categorieProbleme!.id,
        statuts: this.ticket.statuts,
        developpeurId: this.editTicketForm.value.developpeurId
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
    }
    else if (this.currentUser?.role.toLowerCase() === 'développeur' && this.editStatusMode) {
      if (!this.editTicketForm.value.statuts) {
        alert('Veuillez sélectionner un statut.');
        return;
      }
      const updatedTicket: TicketUpdateDto = {
        id: this.ticket.id,
        titre: this.ticket.titre,
        description: this.ticket.description,
        priorite: this.ticket.priorite,
        qualification: this.ticket.qualification,
        projetId: this.ticket.projet!.id,
        categorieProblemeId: this.ticket.categorieProbleme!.id,
        statuts: this.editTicketForm.value.statuts
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
    if (!this.currentUser) return false;
    const role = this.currentUser.role.toLowerCase();
    return role === 'super admin' || role === 'chef de projet';
  }

  shouldShowClientAndDev(): boolean {
    return this.currentUser ? this.currentUser.role.toLowerCase() !== 'client' : false;
  }

  isActionable(): boolean {
    if (!this.ticket || !this.currentUser) return false;
    const role = this.currentUser.role.toLowerCase();
    return (role === 'super admin' || role === 'chef de projet') &&
           this.ticket.statuts.toLowerCase() === 'non ouvert';
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
    if (!this.ticket || !this.selectedDevId) return;
    
    const updatedTicket: TicketUpdateDto = {
      id: this.ticket.id,
      titre: this.ticket.titre,
      description: this.ticket.description,
      priorite: this.ticket.priorite,
      qualification: this.ticket.qualification,
      projetId: this.ticket.projet!.id,
      categorieProblemeId: this.ticket.categorieProbleme!.id,
      statuts: 'accepté',
      developpeurId: this.selectedDevId
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
    if (!this.ticket) return;
    
    const updatedTicket: TicketUpdateDto = {
      id: this.ticket.id,
      titre: this.ticket.titre,
      description: this.ticket.description,
      priorite: this.ticket.priorite,
      qualification: this.ticket.qualification,
      projetId: this.ticket.projet!.id,
      categorieProblemeId: this.ticket.categorieProbleme!.id,
      statuts: 'refusé',
      raisonRejet: this.rejectionForm.value.reason
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
    if (!this.ticket) return;
    
    const updatedTicket: TicketUpdateDto = {
      ...this.ticket,
      statuts: 'en cours'
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
    if (!this.ticket || !this.selectedNewDevId) return;

    const updatedTicket: TicketUpdateDto = {
      ...this.ticket,
      developpeurId: this.selectedNewDevId,
      raisonRejet: this.developerRejectionForm.value.reason,
      statuts: 'accepté'
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