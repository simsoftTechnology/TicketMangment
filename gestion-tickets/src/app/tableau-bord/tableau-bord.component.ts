import { NgClass, NgFor, NgIf } from '@angular/common';
import { AfterViewInit, Component, HostListener, OnInit } from '@angular/core';
import { User } from '../_models/user';
import { AccountService } from '../_services/account.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Color, NgxChartsModule, ScaleType, LegendPosition } from '@swimlane/ngx-charts';
import { TicketService } from '../_services/ticket.service';
import { DashboardService } from '../_services/dashboard.service';
import { GlobalLoaderService } from '../_services/global-loader.service';

@Component({
  selector: 'app-tableau-bord',
  standalone: true,
  imports: [NgFor, NgxChartsModule, RouterLink],
  templateUrl: './tableau-bord.component.html',
  styleUrls: ['./tableau-bord.component.css']
})
export class TableauBordComponent implements OnInit, AfterViewInit {
  LegendPosition = LegendPosition;
  currentUser: User | null = null;
  userInitials = "";

  ticketCounts: any[] = [];
  view: [number, number] = [1400, 500]; // Taille par défaut (sera mise à jour dynamiquement)

  colorScheme: Color = {
    name: 'custom-gradient',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: [
      '#ffbb94', 
      '#fb9590', 
      '#dc586d', 
      '#a33757', 
      '#852e4e', 
      '#4c1d3d'
    ]
  };

  // Propriétés pour les petits containers
  categoriesCount: number = 0;
  paysCount: number = 0;
  projectsCount: number = 0;
  societesCount: number = 0;
  statutsCount: number = 0;
  ticketsCount: number = 0;
  usersCount: number = 0;

  constructor(
    private ticketService: TicketService,
    private accountService: AccountService,
    private router: Router,
    private dashboardService: DashboardService,
    private route: ActivatedRoute,
    private globalLoaderService: GlobalLoaderService
  ) { }

  ngOnInit(): void {
    this.globalLoaderService.showGlobalLoader();
    this.currentUser = this.accountService.currentUser();
    if (this.currentUser) {
      this.userInitials = this.currentUser.firstName.charAt(0) + this.currentUser.lastName.charAt(0);
      this.loadTicketCounts();
      this.loadDashboardCounts();
    }
    // Définition initiale de la taille du graphique
    this.setChartSize();
  }

  ngAfterViewInit() {
    this.route.fragment.subscribe(fragment => {
      if (fragment === 'pie-chart-container') {
        this.scrollToPieChart();
      }
    });
  }

  private scrollToPieChart() {
    const element = document.getElementById('pie-chart-container');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  logout() {
    this.accountService.logout();
    this.router.navigateByUrl('/');
  }

  loadTicketCounts() {
    this.ticketService.getTicketCountByStatus().subscribe({
      next: (data: any[]) => {
        this.ticketCounts = data.map(item => ({
          id: item.id,
          name: item.name,
          value: item.count
        }));
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des stats par statut', err);
      },
      complete: () => {
        // Masque le loader pour cet appel
        this.globalLoaderService.hideGlobalLoader();
      }
    });
  }

  // Chargement des autres counts du dashboard
  loadDashboardCounts() {
    this.dashboardService.getDashboardCounts().subscribe({
      next: (data: any) => {
        this.categoriesCount = data.categoriesCount;
        this.paysCount       = data.paysCount;
        this.projectsCount   = data.projectsCount;
        this.societesCount   = data.societesCount;
        this.statutsCount    = data.statutsCount;
        this.ticketsCount    = data.ticketsCount;
        this.usersCount      = data.usersCount;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des dashboard counts', err);
      },
      complete: () => {
        // Masque le loader pour cet appel
        this.globalLoaderService.hideGlobalLoader();
      }
    });
  }

  // Mise à jour de la taille du graphique en fonction de la largeur de l'écran
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.setChartSize();
  }

  setChartSize(): void {
    const width = window.innerWidth;
    let chartWidth = 1400; // Valeur par défaut pour grand écran

    if (width < 576) {
      chartWidth = width - 20; // pour mobile, prendre presque toute la largeur
    }else if (width < 960) {
      chartWidth = 800; // pour tablettes
    } else if (width < 1089) {
      chartWidth = 600; // pour tablettes
    }else if (width < 1652) {
      chartWidth = 800; // pour tablettes
    }else if (width < 1290) {
      chartWidth = 600; // pour tablettes
    }
    this.view = [chartWidth, 500];
  }

  isSuperAdmin(): boolean {
    return this.currentUser?.role === 'Super Admin';
  }
  
  isChefDeProjet(): boolean {
    return this.currentUser?.role === 'Chef de Projet';
  }
  
  isCollaborateur(): boolean {
    return this.currentUser?.role === 'Collaborateur';
  }
  
  isClient(): boolean {
    return this.currentUser?.role === 'Client';
  }
}