import { Component, OnInit, inject } from '@angular/core';
import { TicketService } from '../../_services/ticket.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { PaginatedResult } from '../../_models/pagination';
import { Ticket } from '../../_models/ticket';
import { AccountService } from '../../_services/account.service';
import { User } from '../../_models/user';
import { QualificationService } from '../../_services/qualification.service';
import { PrioriteService } from '../../_services/priorite.service';
import { StatusService } from '../../_services/status.service';
import { ToastrService } from 'ngx-toastr';
import { ConfirmModalComponent } from '../../confirm-modal/confirm-modal.component';
import { OverlayModalService } from '../../_services/overlay-modal.service';

@Component({
  selector: 'app-list-tickets',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './list-tickets.component.html',
  styleUrls: ['./list-tickets.component.css']
})
export class ListTicketsComponent implements OnInit {
  private ticketService = inject(TicketService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  accountService = inject(AccountService);
  private qualificationService = inject(QualificationService);
  private priorityService = inject(PrioriteService);
  private statusService = inject(StatusService);
  private toastr = inject(ToastrService);
  private overlayModalService = inject(OverlayModalService);

  currentUser: User | null = null;
  pageNumber: number = 1;
  pageSize: number = 9;
  paginatedResult: PaginatedResult<Ticket[]> | null = null;
  jumpPage: number = 1;
  ticketsSearchTerm: string = '';
  newTicketId: number | null = null;
  currentFilterType: string = ''

  // Nouveaux tableaux pour qualifications, priorités et statuts
  qualifications: { id: number, name: string }[] = [];
  priorities: { id: number, name: string }[] = [];
  statuses: { id: number, name: string }[] = [];

  ngOnInit(): void {
    this.currentUser = this.accountService.currentUser();
    this.loadQualifications();
    this.loadPriorities();
    this.loadStatuses();

    this.route.queryParams.subscribe(params => {
      const newTicket = params['newTicket'];
      if (newTicket) {
        this.newTicketId = +newTicket;
        this.getTickets();
        this.router.navigate([], {
          queryParams: { newTicket: null },
          queryParamsHandling: 'merge',
          replaceUrl: true
        });
        setTimeout(() => { this.newTicketId = null; }, 2000);
      } else {
        this.getTickets();
      }
    });
  }

  loadQualifications(): void {
    this.qualificationService.getQualifications().subscribe({
      next: (data) => {
        this.qualifications = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des qualifications', err);
      }
    });
  }

  loadPriorities(): void {
    this.priorityService.getPriorites().subscribe({
      next: (data) => {
        this.priorities = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des priorités', err);
      }
    });
  }

  loadStatuses(): void {
    this.statusService.getStatuses().subscribe({
      next: (data) => {
        this.statuses = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des statuts', err);
      }
    });
  }

  getTickets(): void {
    this.ticketService
      .getPaginatedTickets(
        this.pageNumber,
        this.pageSize,
        this.ticketsSearchTerm,
        this.currentFilterType  // Transmission du filtre ici
      )
      .subscribe({
        next: (response) => {
          console.log('Réponse reçue:', response);
          const updatedItems = (response.items ?? []).map(ticket => {
            ticket.createdAt = new Date(ticket.createdAt);
            if (ticket.updatedAt) {
              ticket.updatedAt = new Date(ticket.updatedAt);
            }
            return { ...ticket, selected: ticket.selected ?? false };
          });
          this.paginatedResult = {
            items: updatedItems,
            pagination: response.pagination
          };
        },
        error: (error) => {
          console.error('Erreur API:', error);
          console.error('Erreur lors du chargement des tickets paginés', error);
        }
      });
  }


  onSearchChange(): void {
    this.pageNumber = 1;
    this.getTickets();
  }

  onPageChange(newPage: number): void {
    const maxPage = this.paginatedResult?.pagination?.totalPages || 1;
    this.pageNumber = Math.min(Math.max(newPage, 1), maxPage);
    this.jumpPage = this.pageNumber;
    this.getTickets();
  }

  jumpToPage(): void {
    const totalPages = this.paginatedResult?.pagination?.totalPages || 1;
    this.jumpPage = Math.min(Math.max(Number(this.jumpPage), 1), totalPages);
    this.onPageChange(this.jumpPage);
  }

  selectAll(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const currentItems = this.paginatedResult?.items ?? [];
    currentItems.forEach(ticket => ticket.selected = checkbox.checked);
  }

  toggleSelection(ticket: Ticket): void {
    ticket.selected = !ticket.selected;
    const currentItems = this.paginatedResult?.items ?? [];
    const allSelected = currentItems.every(t => t.selected);
    const selectAllCheckbox = document.getElementById('selectAll') as HTMLInputElement;
    if (selectAllCheckbox) {
      selectAllCheckbox.checked = allSelected;
    }
  }


  deleteSelectedTickets(): void {
    const items = this.paginatedResult?.items ?? [];
    const selectedIds = items.filter(ticket => ticket.selected).map(ticket => ticket.id);

    if (selectedIds.length === 0) {
      this.toastr.warning("Aucun ticket sélectionné pour la suppression.");
      return;
    }

    const modalInstance = this.overlayModalService.open(ConfirmModalComponent);
    modalInstance.message = "Êtes-vous sûr de vouloir supprimer les tickets sélectionnés ?";

    modalInstance.confirmed.subscribe(() => {
      this.ticketService.deleteMultipleTickets(selectedIds).subscribe({
        next: () => {
          this.toastr.success("Tickets supprimés avec succès.");
          this.getTickets();
        },
        error: error => {
          console.error("Erreur lors de la suppression des tickets", error);
          this.toastr.error("Une erreur est survenue lors de la suppression.");
        }
      });
      this.overlayModalService.close();
    });

    modalInstance.cancelled.subscribe(() => {
      this.overlayModalService.close();
    });
  }


  range(start: number, end: number): number[] {
    return Array(end - start + 1).fill(0).map((_, i) => start + i);
  }

  getPriorityClass(priorityId: number): string {
    switch (priorityId) {
      case 1:
        return 'priority-urgent';
      case 2:
        return 'priority-eleve';
      case 3:
        return 'priority-moyen';
      case 4:
        return 'priority-faible';
      default:
        return '';
    }
  }


  getQualificationLabel(qualificationId: number): string {
    const found = this.qualifications.find(q => q.id === qualificationId);
    return found ? found.name : 'Non défini';
  }

  getPriorityLabel(priorityId: number): string {
    const found = this.priorities.find(p => p.id === priorityId);
    return found ? found.name : '';
  }

  getStatusLabel(statutId: number): string {
    const found = this.statuses.find(s => s.id === statutId);
    return found ? found.name : '';
  }

  // Afficher les tickets directement associés (owner, responsable, chef de projet)
showDirectTickets(): void {
  this.currentFilterType = 'associated';
  this.pageNumber = 1;
  this.getTickets();
}

// Afficher les tickets associés via ProjetUser
showProjetUserTickets(): void {
  this.currentFilterType = 'projetUser';
  this.pageNumber = 1;
  this.getTickets();
}

// Pour revenir à l'affichage par défaut (aucun filtre spécifique)
clearFilter(): void {
  this.currentFilterType = '';
  this.pageNumber = 1;
  this.getTickets();
}

}
