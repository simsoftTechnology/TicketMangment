import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { User } from '../_models/user';
import { AccountService } from '../_services/account.service';
import { Router } from '@angular/router';
import { Color, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';
import { TicketService } from '../_services/ticket.service';

@Component({
  selector: 'app-tableau-bord',
  standalone: true,
  imports: [NgFor, NgxChartsModule],
  templateUrl: './tableau-bord.component.html',
  styleUrl: './tableau-bord.component.css'
})
export class TableauBordComponent implements OnInit {


  currentUser: User | null = null;

  userInitials = "";

  ticketCounts: any[] = [];
  view: [number, number] = [1400, 500]; // Taille du graphiqu
  colorScheme: Color = {
    name: 'default',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#FF7F11', '#C0754D',  '#FF1B1C', '#fbc353', '#88b79b', '#A10A28']
  };

  constructor(
    private ticketService: TicketService,
    private accountService: AccountService,
    private router: Router
  ) { }
  ngOnInit(): void {
    this.currentUser = this.accountService.currentUser();
    if (this.currentUser) {
      this.userInitials = this.currentUser.firstName.charAt(0) + this.currentUser.lastName.charAt(0);
      this.loadTicketCounts();
    }
  }
  logout() {
    this.accountService.logout();
    this.router.navigateByUrl('/');
  }
  loadTicketCounts() {
    this.ticketService.getTicketCountByStatus().subscribe({
      next: (data: any[]) => {
        // Transformation des données reçues pour correspondre au format { name, value }
        // Supposons que le service retourne [{ name: 'En cours', count: 5 }, ...]
        this.ticketCounts = data.map(item => ({
          id: item.id,
          name: item.name,
          value: item.count
        }));
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des stats par statut', err);
      }
    });
  }
}