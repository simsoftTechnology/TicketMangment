import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { User } from '../_models/user';
import { AccountService } from '../_services/account.service';
import { Router } from '@angular/router';
import { Color, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-tableau-bord',
  imports: [  NgFor, NgIf, NgxChartsModule],
  templateUrl: './tableau-bord.component.html',
  styleUrl: './tableau-bord.component.css'
})
export class TableauBordComponent implements OnInit{
  accountService = inject(AccountService);
  private router = inject(Router);
  
  currentUser: User | null = null;
  
  userInitials = "";
  ngOnInit(): void {
    this.currentUser = this.accountService.currentUser();
    if(this.currentUser) {
    this.userInitials = this.currentUser.firstName.charAt(0) + this.currentUser.lastName.charAt(0);
  }
  }
  logout() {
    this.accountService.logout();
    this.router.navigateByUrl('/');
  }

  userRole = 'Super Admin'; // Peut être 'Super Admin', 'Chef de Projet', 'Collaborateur', 'Client'
  
  // Période sélectionnée
  selectedPeriod = 'month'; // 'day', 'week', 'month', 'year'
  
  // Statistiques globales
  ticketStats = {
    total: 245,
    enCours: 78,
    resolus: 142,
    valides: 25
  };
  
  // Tickets par priorité - Format ngx-charts
  priorityChartData = [
    { name: 'Urgent', value: 45 },
    { name: 'Élevée', value: 67 },
    { name: 'Moyenne', value: 98 },
    { name: 'Basse', value: 35 }
  ];
  
  // Couleurs personnalisées pour les priorités
  priorityColorScheme: Color = {
    name: 'priorityColors',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#EF4444', '#F97316', '#FBBF24', '#34D399']
  };
  
  // Tickets par statut - Format ngx-charts
  statusChartData = [
    { name: 'Nouveau', value: 32 },
    { name: 'En cours', value: 78 },
    { name: 'Résolu', value: 142 },
    { name: 'Validé', value: 25 },
    { name: 'Fermé', value: 18 }
  ];
  
  // Couleurs personnalisées pour les statuts
  statusColorScheme: Color = {
    name: 'statusColors',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#6366F1', '#F97316', '#22C55E', '#0EA5E9', '#6B7280']
  };
  
  // Tickets par qualification
  ticketsByQualification = [
    { name: 'Demande d\'information', count: 87 },
    { name: 'Incident', count: 65 },
    { name: 'Demande de changement', count: 43 },
    { name: 'Problème technique', count: 50 }
  ];
  
  // Tickets par catégorie de problème - Format ngx-charts
  categoryChartData = [
    { name: 'Divalto Commerce & Logistique', value: 95 },
    { name: 'Infrastructure', value: 45 },
    { name: 'Développement', value: 62 },
    { name: 'Support Utilisateur', value: 43 }
  ];
  
  // Couleurs personnalisées pour les catégories
  categoryColorScheme: Color = {
    name: 'categoryColors',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#6366F1', '#F97316', '#22C55E', '#0EA5E9']
  };
  
  // Données pour l'évolution temporelle - Format ngx-charts
  timelineChartData = [
    {
      name: 'Créés',
      series: [
        { name: 'Jan', value: 25 },
        { name: 'Fév', value: 30 },
        { name: 'Mar', value: 35 },
        { name: 'Avr', value: 40 },
        { name: 'Mai', value: 28 },
        { name: 'Juin', value: 32 },
        { name: 'Juil', value: 42 },
        { name: 'Août', value: 38 },
        { name: 'Sep', value: 45 },
        { name: 'Oct', value: 50 },
        { name: 'Nov', value: 55 },
        { name: 'Déc', value: 48 }
      ]
    },
    {
      name: 'Résolus',
      series: [
        { name: 'Jan', value: 20 },
        { name: 'Fév', value: 25 },
        { name: 'Mar', value: 30 },
        { name: 'Avr', value: 35 },
        { name: 'Mai', value: 25 },
        { name: 'Juin', value: 30 },
        { name: 'Juil', value: 38 },
        { name: 'Août', value: 35 },
        { name: 'Sep', value: 40 },
        { name: 'Oct', value: 45 },
        { name: 'Nov', value: 50 },
        { name: 'Déc', value: 45 }
      ]
    },
    {
      name: 'Validés',
      series: [
        { name: 'Jan', value: 15 },
        { name: 'Fév', value: 20 },
        { name: 'Mar', value: 25 },
        { name: 'Avr', value: 30 },
        { name: 'Mai', value: 20 },
        { name: 'Juin', value: 25 },
        { name: 'Juil', value: 30 },
        { name: 'Août', value: 30 },
        { name: 'Sep', value: 35 },
        { name: 'Oct', value: 40 },
        { name: 'Nov', value: 45 },
        { name: 'Déc', value: 40 }
      ]
    }
  ];
  
  // Couleurs personnalisées pour l'évolution temporelle
  timelineColorScheme: Color = {
    name: 'timelineColors',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#6366F1', '#22C55E', '#0EA5E9']
  };
  
  // Répartition par rôle - Format ngx-charts
  roleChartData = [
    {
      name: 'Tickets créés',
      series: [
        { name: 'Super Admin', value: 35 },
        { name: 'Chef de Projet', value: 78 },
        { name: 'Collaborateur', value: 120 },
        { name: 'Client', value: 12 }
      ]
    },
    {
      name: 'Tickets résolus',
      series: [
        { name: 'Super Admin', value: 42 },
        { name: 'Chef de Projet', value: 65 },
        { name: 'Collaborateur', value: 95 },
        { name: 'Client', value: 0 }
      ]
    }
  ];
  
  // Couleurs personnalisées pour les rôles
  roleColorScheme: Color = {
    name: 'roleColors',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#6366F1', '#22C55E']
  };
  
  // Temps de résolution moyen (en heures) - Format ngx-charts
  resolutionTimeChartData = [
    { name: 'Urgent', value: 8 },
    { name: 'Élevée', value: 16 },
    { name: 'Moyenne', value: 32 },
    { name: 'Basse', value: 48 }
  ];
  
  // Couleurs personnalisées pour le temps de résolution
  resolutionTimeColorScheme: Color = {
    name: 'resolutionTimeColors',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#EF4444', '#F97316', '#FBBF24', '#34D399']
  };
  
  // Temps de résolution moyen global
  averageResolutionTime = 24;
  
  // Filtres disponibles
  filters = {
    periods: ['Aujourd\'hui', 'Cette semaine', 'Ce mois', 'Cette année', 'Personnalisé'],
    priorities: ['Toutes', 'Urgent', 'Élevée', 'Moyenne', 'Basse'],
    statuses: ['Tous', 'Nouveau', 'En cours', 'Résolu', 'Validé', 'Fermé'],
    qualifications: ['Toutes', 'Demande d\'information', 'Incident', 'Demande de changement', 'Problème technique'],
    categories: ['Toutes', 'Divalto Commerce & Logistique', 'Infrastructure', 'Développement', 'Support Utilisateur'],
    roles: ['Tous', 'Super Admin', 'Chef de Projet', 'Collaborateur', 'Client'],
    companies: ['Toutes', 'SIMSOFT', 'Client A', 'Client B', 'Client C'],
    countries: ['Tous', 'France', 'Tunisie', 'Maroc', 'Algérie']
  };
  
  // Liste des tickets récents
  recentTickets = [
    { id: 'TK-2023-001', title: 'Problème de connexion à Divalto', author: 'Jean Dupont', priority: 'Urgent', status: 'En cours', created: '2023-10-15', category: 'Divalto Commerce & Logistique' },
    { id: 'TK-2023-002', title: 'Erreur lors de la génération de facture', author: 'Marie Martin', priority: 'Élevée', status: 'Nouveau', created: '2023-10-14', category: 'Divalto Commerce & Logistique' },
    { id: 'TK-2023-003', title: 'Demande d\'ajout d\'utilisateur', author: 'Pierre Durand', priority: 'Moyenne', status: 'Résolu', created: '2023-10-12', category: 'Support Utilisateur' },
    { id: 'TK-2023-004', title: 'Bug dans le module de stock', author: 'Sophie Petit', priority: 'Élevée', status: 'En cours', created: '2023-10-10', category: 'Divalto Commerce & Logistique' },
    { id: 'TK-2023-005', title: 'Mise à jour serveur requise', author: 'Thomas Leroy', priority: 'Basse', status: 'Validé', created: '2023-10-08', category: 'Infrastructure' }
  ];
  
  // Alertes et notifications
  alerts = [
    { type: 'urgent', message: '3 tickets urgents en attente de traitement', time: '2h' },
    { type: 'delay', message: 'Ticket TK-2023-001 en retard de 24h', time: '1j' },
    { type: 'update', message: 'Nouveau commentaire sur TK-2023-004', time: '30m' }
  ];
  
  // Commentaires récents
  recentComments = [
    { ticket: 'TK-2023-004', author: 'Sophie Petit', comment: 'Le problème persiste après la mise à jour.', time: '1h' },
    { ticket: 'TK-2023-003', author: 'Pierre Durand', comment: 'Merci pour la résolution rapide !', time: '3h' },
    { ticket: 'TK-2023-001', author: 'Jean Dupont', comment: 'J\'ai fourni les logs demandés.', time: '5h' }
  ];
  
  // Statistiques par utilisateur
  userStats = [
    { name: 'Thomas Leroy', role: 'Chef de Projet', created: 25, resolved: 32, avgTime: 18 },
    { name: 'Marie Martin', role: 'Collaborateur', created: 42, resolved: 38, avgTime: 22 },
    { name: 'Pierre Durand', role: 'Collaborateur', created: 35, resolved: 30, avgTime: 24 }
  ];
  
  // Vue projet
  projects = [
    { name: 'Déploiement Divalto v12', tickets: 45, open: 15, closed: 30, company: 'Client A' },
    { name: 'Migration Infrastructure', tickets: 32, open: 20, closed: 12, company: 'SIMSOFT' },
    { name: 'Formation Utilisateurs', tickets: 28, open: 5, closed: 23, company: 'Client B' }
  ];
  
  // Contrats
  contracts = [
    { id: 'CT-2023-001', type: 'Client-Societe', client: 'Client A', company: 'SIMSOFT', startDate: '2023-01-01', endDate: '2023-12-31', status: 'Actif' },
    { id: 'CT-2023-002', type: 'Societe-Societe', client: 'SIMSOFT', company: 'Fournisseur X', startDate: '2023-03-15', endDate: '2024-03-14', status: 'Actif' },
    { id: 'CT-2022-005', type: 'Client-Societe', client: 'Client B', company: 'SIMSOFT', startDate: '2022-06-01', endDate: '2023-05-31', status: 'Expiré' }
  ];
  
  // Options pour les graphiques ngx-charts
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  showYAxisLabel = true;
  xAxisLabel = 'Catégories';
  yAxisLabel = 'Nombre de tickets';
  legendTitle = 'Légende';
  
  // Options spécifiques pour les graphiques circulaires
  doughnut = true;
  arcWidth = 0.5;
  
  // Options pour les graphiques linéaires
  timeline = false;
  autoScale = true;
  
  constructor() { }
  
  
  // Méthodes pour les filtres
  applyFilters(): void {
    console.log('Filtres appliqués');
    // Logique pour appliquer les filtres
  }
  
  resetFilters(): void {
    console.log('Filtres réinitialisés');
    // Logique pour réinitialiser les filtres
  }
  
  // Méthode pour la recherche
  search(query: string): void {
    console.log('Recherche:', query);
    // Logique pour la recherche
  }
  
  // Méthode pour changer la période
  changePeriod(period: string): void {
    this.selectedPeriod = period;
    console.log('Période changée:', period);
    // Logique pour mettre à jour les données selon la période
  }
  
  // Méthode pour formater les étiquettes des axes
  axisFormat(val: any): string {
    return val.toString();
  }
  
  // Méthode pour formater les valeurs dans les tooltips
  valueFormat(val: any): string {
    return val.toString();
  }
  
  // Méthode pour calculer le pourcentage pour les barres de qualification
  getPercentage(count: number): number {
    return (count / this.ticketStats.total) * 100;
  }
}
