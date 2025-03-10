import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AjouterProjetComponent } from '../Projets/ajouter-projet/ajouter-projet.component';
import { AjouterSocieteComponent } from '../Societes/ajouter-societe/ajouter-societe.component';
import { MatStepperModule } from '@angular/material/stepper';
import { AjouterClientComponent } from '../Clients/ajouter-client/ajouter-client.component';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-workflow-creation',
  standalone: true,
  imports: [
    AjouterProjetComponent,
    AjouterSocieteComponent,
    AjouterClientComponent,
    CommonModule,
    MatStepperModule,
    MatIconModule,
  ],
  templateUrl: './workflow-creation.component.html',
  styleUrls: ['./workflow-creation.component.css']
})
export class WorkflowCreationComponent {
  societeForm: FormGroup;
  projetForm: FormGroup;
  clientForm: FormGroup;

  societeData: any;
  projetData: any;
  clientData: any;

  constructor(private fb: FormBuilder, private router: Router) {
    this.societeForm = this.fb.group({
      // Contrôles spécifiques à la création de la société
      name: ['', Validators.required]
    });
    this.projetForm = this.fb.group({
      // Contrôles pour le projet
      title: ['', Validators.required]
    });
    this.clientForm = this.fb.group({
      // Contrôles pour le client (ex. email)
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSocieteCreated(data: any): void {
    this.societeData = data;
    console.log('Société créée:', data);
  }

  onProjetCreated(data: any): void {
    this.projetData = data;
    console.log('Projet créé:', data);
  }

  onClientCreated(data: any): void {
    this.clientData = data;
    console.log('Client créé:', data);
  }

  finishWizard(): void {
    console.log('Workflow terminé', {
      societe: this.societeData,
      projet: this.projetData,
      client: this.clientData
    });
    // Par exemple, rediriger vers un dashboard ou afficher un message de succès.
  }
}
