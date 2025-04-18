import { Component, OnInit, inject } from '@angular/core';
import { TicketService } from '../../_services/ticket.service';
import { AccountService } from '../../_services/account.service';
import { Ticket } from '../../_models/ticket';
import { PaginatedResult } from '../../_models/pagination';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-mes-tickets',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mes-tickets.component.html',
  styleUrls: ['./mes-tickets.component.css']
})
export class MesTicketsComponent implements OnInit {
  private ticketService = inject(TicketService);
  private accountService = inject(AccountService);
  private toastr = inject(ToastrService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // On démarre avec le filtre "associated" (tickets directement associés)
  currentFilterType: string = 'associated';
  currentUser = this.accountService.currentUser();
  pageNumber: number = 1;
  pageSize: number = 9;
  ticketsSearchTerm: string = '';
  paginatedResult: PaginatedResult<Ticket[]> | null = null;
  jumpPage: number = 1;

  ngOnInit(): void {
    this.getTickets();
  }

  // Récupère les tickets en transmettant le filtre défini
  getTickets(): void {
    this.ticketService.getPaginatedTickets(
      this.pageNumber,
      this.pageSize,
      this.ticketsSearchTerm,
      this.currentFilterType
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
      }
    });
  }

  // Permet de rechercher et de recharger la liste
  onSearchChange(): void {
    this.pageNumber = 1;
    this.getTickets();
  }

  // Change le filtre pour afficher les tickets directement associés
  showDirectTickets(): void {
    this.currentFilterType = 'associated';
    this.pageNumber = 1;
    this.getTickets();
  }

  // Change le filtre pour afficher les tickets associés via ProjetUser
  showProjetUserTickets(): void {
    this.currentFilterType = 'projetUser';
    this.pageNumber = 1;
    this.getTickets();
  }

  // Gestion de la pagination
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
}
