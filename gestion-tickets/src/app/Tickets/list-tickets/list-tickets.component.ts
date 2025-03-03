import { Component, OnInit, inject } from '@angular/core';
import { TicketService } from '../../_services/ticket.service';
import { CommonModule, NgFor, NgIf, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { PaginatedResult } from '../../_models/pagination';
import { Ticket } from '../../_models/ticket';
import { AccountService } from '../../_services/account.service';
import { User } from '../../_models/user';

@Component({
    selector: 'app-list-tickets',
    imports: [NgFor, NgIf, NgClass, FormsModule, RouterLink, CommonModule],
    templateUrl: './list-tickets.component.html',
    styleUrls: ['./list-tickets.component.css']
})
export class ListTicketsComponent implements OnInit {
  private ticketService = inject(TicketService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  accountService = inject(AccountService);
  
  currentUser: User | null = null;
  // Variables pour la pagination
  pageNumber: number = 1;
  pageSize: number = 9;
  paginatedResult: PaginatedResult<Ticket[]> | null = null;
  jumpPage: number = 1;

  // Terme de recherche pour filtrer les tickets
  ticketsSearchTerm: string = '';

  // Variable pour conserver l'ID du ticket ajouté récemment (pour surligner)
  newTicketId: number | null = null;

  ngOnInit(): void {
    this.currentUser = this.accountService.currentUser();
    this.route.queryParams.subscribe(params => {
      const newTicket = params['newTicket'];
      if (newTicket) {
        this.newTicketId = +newTicket;
        // Recharger la liste pour inclure le nouveau ticket
        this.getTickets();
        // Supprimer le paramètre "newTicket" de l'URL pour éviter qu'il ne soit retraité
        this.router.navigate([], {
          queryParams: { newTicket: null },
          queryParamsHandling: 'merge',
          replaceUrl: true
        });
        // Supprimer la surbrillance après 2 secondes
        setTimeout(() => { this.newTicketId = null; }, 2000);
      } else {
        this.getTickets();
      }
    });
  }

  // Appel du service pour charger les tickets paginés en passant le terme de recherche
  getTickets(): void {
    this.ticketService.getPaginatedTickets(this.pageNumber, this.pageSize, this.ticketsSearchTerm).subscribe({
      next: (response) => {
        // Conversion des dates et initialisation de la propriété selected
        const updatedItems = (response.items ?? []).map(ticket => {
          ticket.dateCreation = new Date(ticket.dateCreation);
          if (ticket.dateModification) {
            ticket.dateModification = new Date(ticket.dateModification);
          }
          return { ...ticket, selected: ticket.selected ?? false };
        });
        this.paginatedResult = {
          items: updatedItems,
          pagination: response.pagination
        };
      },
      error: (error) => {
        console.error('Erreur lors du chargement des tickets paginés', error);
      }
    });
  }

  // Déclenché lors du changement de terme de recherche
  onSearchChange(): void {
    this.pageNumber = 1;
    this.getTickets();
  }
  
  // Changement de page
  onPageChange(newPage: number): void {
    const maxPage = this.paginatedResult?.pagination?.totalPages || 1;
    this.pageNumber = Math.min(Math.max(newPage, 1), maxPage);
    this.jumpPage = this.pageNumber;
    this.getTickets();
  }

  // Saut direct vers une page donnée
  jumpToPage(): void {
    const totalPages = this.paginatedResult?.pagination?.totalPages || 1;
    this.jumpPage = Math.min(Math.max(Number(this.jumpPage), 1), totalPages);
    this.onPageChange(this.jumpPage);
  }

  // Retourne un tableau de numéros de page
  getPages(): number[] {
    const totalPages = this.paginatedResult?.pagination?.totalPages || 0;
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // Sélection de tous les tickets de la page courante
  selectAll(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const currentItems = this.paginatedResult?.items ?? [];
    currentItems.forEach(ticket => ticket.selected = checkbox.checked);
  }

  // Bascule la sélection d'un ticket
  toggleSelection(ticket: Ticket): void {
    ticket.selected = !ticket.selected;
    const currentItems = this.paginatedResult?.items ?? [];
    const allSelected = currentItems.every(t => t.selected);
    const selectAllCheckbox = document.getElementById('selectAll') as HTMLInputElement;
    if (selectAllCheckbox) {
      selectAllCheckbox.checked = allSelected;
    }
  }

  // Suppression d'un ticket
  deleteTicket(ticket: Ticket): void {
    if (confirm(`Voulez-vous vraiment supprimer le ticket "${ticket.titre}" ?`)) {
      this.ticketService.deleteTicket(ticket.id).subscribe({
        next: () => {
          alert('Ticket supprimé avec succès.');
          this.getTickets();
        },
        error: error => {
          console.error('Erreur lors de la suppression du ticket', error);
          alert('Une erreur est survenue lors de la suppression.');
        }
      });
    }
  }

  // Suppression des tickets sélectionnés
  deleteSelectedTickets(): void {
    const items = this.paginatedResult?.items ?? [];
    const selectedIds = items.filter(ticket => ticket.selected).map(ticket => ticket.id);
        
    if (selectedIds.length === 0) {
      alert("Aucun ticket sélectionné pour la suppression.");
      return;
    }
  
    if (confirm("Êtes-vous sûr de vouloir supprimer les tickets sélectionnés ?")) {
      this.ticketService.deleteMultipleTickets(selectedIds).subscribe({
        next: () => {
          alert("Tickets supprimés avec succès.");
          this.getTickets();
        },
        error: error => {
          console.error("Erreur lors de la suppression des tickets", error);
          alert("Une erreur est survenue lors de la suppression.");
        }
      });
    }
  }

  // Génère un tableau pour itérer sur les tailles de page (par exemple de 1 à 10)
  range(start: number, end: number): number[] {
    return Array(end - start + 1).fill(0).map((_, i) => start + i);
  }

  getPriorityClass(priority: string): string {
    if (!priority) return '';
    switch (priority.toLowerCase()) {
      case 'urgent':
        return 'priority-urgent';
      case 'élevé':
        return 'priority-eleve';
      case 'moyen':
        return 'priority-moyen';
      case 'faible':
        return 'priority-faible';
      default:
        return '';
    }
  }
  
  getStatusClass(status: string): string {
    if (!status) return '';
    switch (status.toLowerCase()) {
      case 'non ouvert':
        return 'status-non-ouvert';
      case 'accepté':
        return 'status-accepte';
      case 'refusé':
        return 'status-refuse';
      case 'en cours':
        return 'status-en-cours';
      case 'résolu':
        return 'status-resolu';
      default:
        return '';
    }
  }
  
  
}
