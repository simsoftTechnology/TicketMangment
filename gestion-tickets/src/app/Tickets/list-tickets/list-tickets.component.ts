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
import { TicketFilterComponent } from '../../_filters/ticket-filter/ticket-filter.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { LoaderService } from '../../_services/loader.service';
import { GlobalLoaderService } from '../../_services/global-loader.service';

@Component({
  selector: 'app-list-tickets',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TicketFilterComponent,
    MatMenuModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './list-tickets.component.html',
  styleUrls: ['./list-tickets.component.css']
})
export class ListTicketsComponent implements OnInit {

  currentUser: User | null = null;
  pageNumber: number = 1;
  pageSize: number = 9;
  paginatedResult: PaginatedResult<Ticket[]> | null = null;
  jumpPage: number = 1;
  ticketsSearchTerm: string = '';
  newTicketId: number | null = null;
  
  currentFilters: any = { filterType: '' };

  // Tableaux pour qualifications, priorités et statuts
  qualifications: { id: number, name: string }[] = [];
  priorities: { id: number, name: string }[] = [];
  statuses: { id: number, name: string }[] = [];

  filterVisible: boolean = false;
  isLoading: boolean = false;
  constructor(
    private ticketService: TicketService,
    private route: ActivatedRoute,
    private router: Router,
    public accountService: AccountService,
    private qualificationService: QualificationService,
    private priorityService: PrioriteService,
    private statusService: StatusService,
    private toastr: ToastrService,
    private overlayModalService: OverlayModalService,
    private loaderService: LoaderService,
    private globalLoaderService: GlobalLoaderService
  ) {
    this.loaderService.isLoading$.subscribe((loading) => {
      this.isLoading = loading;
    });
  }
  ngOnInit(): void {
    // Récupérer le filtre passé par la route
    this.route.data.subscribe(data => {
      this.currentFilters.filterType = data['filterType'] || '';
      this.getTickets();
    });
    

    this.currentUser = this.accountService.currentUser();
    this.loadQualifications();
    this.loadPriorities();
    this.loadStatuses();

    // Si un ticket vient d'être ajouté, gérer l'affichage du nouveau ticket (paramètre newTicket)
    this.route.queryParams.subscribe(params => {
      const newTicket = params['newTicket'];
      if (newTicket) {
        this.newTicketId = +newTicket;
        // Actualiser la liste
        this.getTickets();
        // Réinitialiser l'URL pour retirer le paramètre newTicket
        this.router.navigate([], {
          queryParams: { newTicket: null },
          queryParamsHandling: 'merge',
          replaceUrl: true
        });
        setTimeout(() => { this.newTicketId = null; }, 2000);
      }
    });
  }

  loadQualifications(): void {
    this.qualificationService.getQualifications().subscribe({
      next: (data) => this.qualifications = data,
      error: (err) => console.error('Erreur lors du chargement des qualifications', err)
    });
  }

  loadPriorities(): void {
    this.priorityService.getPriorites().subscribe({
      next: (data) => this.priorities = data,
      error: (err) => console.error('Erreur lors du chargement des priorités', err)
    });
  }

  loadStatuses(): void {
    this.statusService.getStatuses().subscribe({
      next: (data) => this.statuses = data,
      error: (err) => console.error('Erreur lors du chargement des statuts', err)
    });
  }

  getTickets(): void {
    const filters = {
      ...this.currentFilters,
      searchTerm: this.ticketsSearchTerm
    };
    
    // Afficher le loader global avant le début de la requête
    this.globalLoaderService.showGlobalLoader();
    
    this.ticketService.getPaginatedTickets(
      this.pageNumber,
      this.pageSize,
      filters
    ).subscribe({
      next: (response) => {
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
        console.error("Erreur lors du chargement des tickets", error);
        this.toastr.error("Erreur lors du chargement des tickets");
      },
      complete: () => {
        // Masquer le loader global une fois l'opération terminée
        this.globalLoaderService.hideGlobalLoader();
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
    (this.paginatedResult?.items ?? []).forEach(ticket => ticket.selected = checkbox.checked);
  }

  toggleSelection(ticket: Ticket): void {
    ticket.selected = !ticket.selected;
    const allSelected = (this.paginatedResult?.items ?? []).every(t => t.selected);
    const selectAllCheckbox = document.getElementById('selectAll') as HTMLInputElement;
    if (selectAllCheckbox) {
      selectAllCheckbox.checked = allSelected;
    }
  }

  deleteSelectedTickets(): void {
    const selectedIds = (this.paginatedResult?.items ?? [])
      .filter(ticket => ticket.selected)
      .map(ticket => ticket.id);

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

  // Méthode utilitaire pour l'affichage de la pagination
  range(start: number, end: number): number[] {
    return Array(end - start + 1).fill(0).map((_, i) => start + i);
  }

  getPriorityClass(priorityId: number): string {
    switch (priorityId) {
      case 1: return 'priority-urgent';
      case 2: return 'priority-eleve';
      case 3: return 'priority-moyen';
      case 4: return 'priority-faible';
      default: return '';
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

  toggleFilterPanel() {
    this.filterVisible = !this.filterVisible;
  }

  onApplyFilter(filterValues: any) {
    this.currentFilters = filterValues;
    this.pageNumber = 1;
    this.getTickets();
  }
  

  exportTickets(): void {
    // Active le loader
    this.loaderService.showLoader();
    this.ticketService.exportTickets(this.currentFilters).subscribe({
      next: (fileBlob: Blob) => {
        const objectUrl = URL.createObjectURL(fileBlob);
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = `TicketsExport_${new Date().getTime()}.xlsx`;
        a.click();
        URL.revokeObjectURL(objectUrl);
        // Désactive le loader après l'export
        this.loaderService.hideLoader();
      },
      error: (err) => {
        console.error("Erreur lors de l'export des tickets", err);
        this.toastr.error("Erreur lors de l'export des tickets");
        // Désactive le loader même en cas d'erreur
        this.loaderService.hideLoader();
      }
    });
  }
}
