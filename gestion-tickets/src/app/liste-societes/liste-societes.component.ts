import { Component, OnInit } from '@angular/core';
import { SocieteService } from '../_services/societe.service';
import { Societe } from '../_models/societe';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-liste-societes',
  standalone: true,
  imports: [ NgFor, FormsModule ],
  templateUrl: './liste-societes.component.html',
  styleUrl: './liste-societes.component.css'
})
export class ListeSocietesComponent implements OnInit {
  societes: Societe[] = [];

  constructor(private societeService: SocieteService) {}

  ngOnInit(): void {
    this.loadSocietes();
  }

  loadSocietes(): void {
    this.societeService.getSocietes().subscribe(
      (data) => this.societes = data,
      (error) => console.error('Erreur lors du chargement des sociétés', error)
    );
  }

  deleteSociete(id: number): void {
    this.societeService.deleteSociete(id).subscribe(() => {
      this.loadSocietes();
    });
  }

   // Méthode optionnelle pour la gestion de la sélection via la checkbox "select all"
   selectAll(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.societes = this.societes.map(societe => ({
      ...societe,
      selected: checkbox.checked
    }));
  }

  // Méthode optionnelle pour gérer la sélection d'un élément
  toggleSelection(societe: Societe): void {
    societe.selected = !societe.selected;
    // Vous pouvez ajouter ici une logique supplémentaire si besoin (ex: mettre à jour le select all)
  }
}
