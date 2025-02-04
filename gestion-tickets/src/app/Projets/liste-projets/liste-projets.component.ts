import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Projet } from '../../_models/Projet';
import { ProjetService } from '../../_services/projet.service';
import { Societe } from '../../_models/societe';
import { SocieteService } from '../../_services/societe.service';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-liste-projets',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './liste-projets.component.html',
  styleUrl: './liste-projets.component.css'
})
export class ListeProjetsComponent implements OnInit {
  projets: Projet[] = [];
  societes: Societe[] = [];

  constructor(
    private projetService: ProjetService,
    private societeService: SocieteService
  ) {}

  ngOnInit(): void {
    this.loadProjets();
    this.loadSocietes();
  }

  // Charger tous les projets
  loadProjets(): void {
    this.projetService.getProjets().subscribe(
      (data) => {
        this.projets = data;
      },
      (error) => {
        console.error('Erreur lors du chargement des projets', error);
      }
    );
  }

  // Charger les sociétés
  loadSocietes(): void {
    this.societeService.getSocietes().subscribe(
      (data) => {
        this.societes = data;
      },
      (error) => {
        console.error('Erreur lors du chargement des sociétés', error);
      }
    );
  }

  // Supprimer un projet
  deleteProjet(id: number): void {
    this.projetService.deleteProjet(id).subscribe(() => {
      this.loadProjets();  // Recharger la liste après suppression
    });
  }

  selectAll(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.projets = this.projets.map(projet => ({
      ...projet,
      selected: checkbox.checked
    }));
  }

  toggleSelection(projet: Projet): void {
    projet.selected = !projet.selected;
    const allSelected = this.projets.every(u => u.selected);
    const selectAllCheckbox = document.getElementById('selectAll') as HTMLInputElement;
    if (selectAllCheckbox) {
      selectAllCheckbox.checked = allSelected;
    }
  }
}
