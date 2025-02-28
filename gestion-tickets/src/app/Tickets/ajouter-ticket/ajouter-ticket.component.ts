import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

// Services pour charger les données depuis la base
import { TicketService } from '../../_services/ticket.service';
import { CategorieProblemeService } from '../../_services/categorie-probleme.service';
import { ProjetService } from '../../_services/projet.service';
import { AccountService } from '../../_services/account.service';
import { PaginatedResult } from '../../_models/pagination';
import { User } from '../../_models/user';

@Component({
    selector: 'app-ajouter-ticket',
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './ajouter-ticket.component.html',
    styleUrls: ['./ajouter-ticket.component.css']
})
export class AjouterTicketComponent implements OnInit {
  addTicketForm: FormGroup;

  // Listes chargées depuis la base
  categories: any[] = [];
  projets: any[] = [];

  // Options pour les selects
  qualificationOptions: string[] = ['Ticket Support', 'Demande de formation', 'demande D\'information'];
  prioriteOptions: string[] = ['Urgent', 'élevé', 'moyen', 'faible'];

  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private ticketService: TicketService,
    private categorieProblemeService: CategorieProblemeService,
    private projetService: ProjetService,
    private accountService: AccountService,
    private toastr: ToastrService,
    private router: Router
  ) {
    // Notez que les contrôles "statuts" et "utilisateurId" ne sont pas présents dans le formulaire
    this.addTicketForm = this.fb.group({
      titre: ['', Validators.required],
      description: ['', Validators.required],
      qualification: ['', Validators.required],
      priorite: ['', Validators.required],
      categorieProblemeId: [null, Validators.required],
      projetId: [null, Validators.required],
      attachement: [null]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadProjets();
  }

  // Chargement des catégories de problème depuis la base
  loadCategories(): void {
    this.categorieProblemeService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (err) => {
        console.error("Erreur lors du chargement des catégories", err);
        this.toastr.error("Erreur lors du chargement des catégories de problèmes.");
      }
    });
  }

  // Chargement des projets depuis la base
  loadProjets(): void {
    this.projetService.getProjets().subscribe({
      next: (projets) => {
        this.projets = projets;
      },
      error: (err) => {
        console.error("Erreur lors du chargement des projets", err);
        this.toastr.error("Erreur lors du chargement des projets.");
      }
    });
  }

  // Gestion de la sélection d'un fichier pour l'attachement
  onFileSelected(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
      this.addTicketForm.patchValue({ attachement: this.selectedFile });
    }
  }

  formSubmitted = false;
  
  // Soumission du formulaire pour créer le ticket
  onSubmit(): void {
    this.formSubmitted = true;

    if (this.addTicketForm.invalid) {
      Object.values(this.addTicketForm.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }

    const formData = new FormData();
    formData.append('titre', this.addTicketForm.get('titre')?.value);
    formData.append('description', this.addTicketForm.get('description')?.value);
    formData.append('qualification', this.addTicketForm.get('qualification')?.value);
    formData.append('priorite', this.addTicketForm.get('priorite')?.value);
    formData.append('categorieProblemeId', this.addTicketForm.get('categorieProblemeId')?.value);
    formData.append('projetId', this.addTicketForm.get('projetId')?.value);

    // Statut automatiquement fixé à "Non ouvert"
    formData.append('statuts', 'Non ouvert');

    // Récupération de l'utilisateur connecté via AccountService
    const currentUser = this.accountService.currentUser();
    if (currentUser) {
      formData.append('utilisateurId', currentUser.id.toString());
    }


    if (this.selectedFile) {
      formData.append('attachement', this.selectedFile, this.selectedFile.name);
    }

    this.ticketService.createTicketWithAttachment(formData).subscribe({
      next: (ticket) => {
        this.toastr.success("Ticket créé avec succès.");
        this.router.navigate(['/home/Tickets'], { queryParams: { newTicket: ticket.id } });
      },
      error: (err) => {
        console.error("Erreur lors de la création du ticket", err);
        this.toastr.error("Erreur lors de la création du ticket.");
      }
    });
  }

  // Créer le ticket et réinitialiser le formulaire pour en ajouter un autre
  createAndReset(): void {
    if (this.addTicketForm.invalid) {
      this.toastr.warning("Veuillez remplir correctement le formulaire.");
      return;
    }

    const formData = new FormData();
    formData.append('titre', this.addTicketForm.get('titre')?.value);
    formData.append('description', this.addTicketForm.get('description')?.value);
    formData.append('qualification', this.addTicketForm.get('qualification')?.value);
    formData.append('priorite', this.addTicketForm.get('priorite')?.value);
    formData.append('categorieProblemeId', this.addTicketForm.get('categorieProblemeId')?.value);
    formData.append('projetId', this.addTicketForm.get('projetId')?.value);

    // Statut et utilisateur ajoutés automatiquement
    formData.append('statuts', 'Non ouvert');
    const currentUser = this.accountService.currentUser();
    if (currentUser) {
      formData.append('utilisateurId', currentUser.id.toString());
    }


    if (this.selectedFile) {
      formData.append('attachement', this.selectedFile, this.selectedFile.name);
    }

    this.ticketService.createTicketWithAttachment(formData).subscribe({
      next: (ticket) => {
        this.toastr.success("Ticket créé avec succès. Vous pouvez en ajouter un autre.");
        this.resetForm();
      },
      error: (err) => {
        console.error("Erreur lors de la création du ticket", err);
        this.toastr.error("Erreur lors de la création du ticket.");
      }
    });
  }

  // Réinitialisation du formulaire
  resetForm(): void {
    this.addTicketForm.reset();
    this.selectedFile = null;
  }

  // Annulation : demande confirmation si le formulaire a été modifié
  cancel(): void {
    if (this.addTicketForm.dirty) {
      if (confirm("Vous avez des modifications non sauvegardées. Voulez-vous vraiment annuler ?")) {
        this.router.navigate(['/home/Tickets']);
      }
    } else {
      this.router.navigate(['/home/Tickets']);
    }
  }
}
