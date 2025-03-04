import { Component, OnInit, OnDestroy, HostListener, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { NgxEditorModule, Editor, Toolbar } from 'ngx-editor';

// Services pour charger les données depuis la base
import { TicketService } from '../../_services/ticket.service';
import { CategorieProblemeService } from '../../_services/categorie-probleme.service';
import { ProjetService } from '../../_services/projet.service';
import { AccountService } from '../../_services/account.service';
import { PrioriteService } from '../../_services/priorite.service';
import { QualificationService } from '../../_services/qualification.service';

@Component({
  selector: 'app-ajouter-ticket',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxEditorModule, FormsModule],
  templateUrl: './ajouter-ticket.component.html',
  styleUrls: ['./ajouter-ticket.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AjouterTicketComponent implements OnInit, OnDestroy {
  addTicketForm: FormGroup;

  // Listes chargées depuis la base
  categories: any[] = [];
  projets: any[] = [];

  // Options pour les selects standards
  qualificationOptions: string[] = [];
  prioriteOptions: string[] = [];

  selectedFile: File | null = null;
  formSubmitted = false;

  // Instance de l'éditeur et configuration de la toolbar pour ngx-editor
  editor!: Editor;
  toolbar!: Toolbar;

  // Variables pour le dropdown Projet
  selectedProjet: any = null;
  isProjetDropdownOpen: boolean = false;
  searchProjet: string = '';
  filteredProjets: any[] = [];

  // Variables pour le dropdown Catégorie
  selectedCategorie: any = null;
  isCategorieDropdownOpen: boolean = false;
  searchCategorie: string = '';
  filteredCategories: any[] = [];

  constructor(
    private fb: FormBuilder,
    private ticketService: TicketService,
    private categorieProblemeService: CategorieProblemeService,
    private projetService: ProjetService,
    private accountService: AccountService,
    private prioriteService: PrioriteService,
    private qualificationService: QualificationService,
    private toastr: ToastrService,
    private router: Router
  ) {
    // Création du formulaire réactif
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
    this.loadPriorites();
    this.loadQualifications();

    // Initialisation de ngx-editor
    this.editor = new Editor();

    // Configuration de la toolbar (personnalisez-la selon vos besoins)
    this.toolbar = [
      ['bold', 'italic', 'underline', 'strike'],
      ['link'],
      ['code', 'blockquote'],
      ['bullet_list', 'ordered_list'],
      ['undo'],
      ['redo']
    ];
  }

  ngOnDestroy(): void {
    // Détruire l'éditeur pour libérer les ressources
    this.editor.destroy();
  }

  // Chargement des catégories depuis la base
  loadCategories(): void {
    this.categorieProblemeService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        // Initialiser la liste filtrée avec toutes les catégories
        this.filteredCategories = [...this.categories];
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
        // Initialiser la liste filtrée avec tous les projets
        this.filteredProjets = [...this.projets];
      },
      error: (err) => {
        console.error("Erreur lors du chargement des projets", err);
        this.toastr.error("Erreur lors du chargement des projets.");
      }
    });
  }


  loadPriorites(): void {
    this.prioriteService.getPriorites().subscribe({
      next: (priorites) => {
        // Supposons que chaque objet Priorite possède une propriété 'name'
        this.prioriteOptions = priorites.map(p => p.name);
      },
      error: (err) => {
        console.error("Erreur lors du chargement des priorités", err);
        this.toastr.error("Erreur lors du chargement des priorités.");
      }
    });
  }

  loadQualifications(): void {
    this.qualificationService.getQualifications().subscribe({
      next: (qualifications) => {
        // Supposons que chaque objet Qualification possède une propriété 'name'
        this.qualificationOptions = qualifications.map(q => q.name);
      },
      error: (err) => {
        console.error("Erreur lors du chargement des qualifications", err);
        this.toastr.error("Erreur lors du chargement des qualifications.");
      }
    });
  }

  // Gestion de l'ouverture/fermeture des dropdowns pour "projet" et "catégorie"
  toggleDropdown(type: string): void {
    if (type === 'projet') {
      this.isProjetDropdownOpen = !this.isProjetDropdownOpen;
      if (this.isProjetDropdownOpen) {
        this.filteredProjets = [...this.projets];
        this.searchProjet = '';
      }
    } else if (type === 'categorie') {
      this.isCategorieDropdownOpen = !this.isCategorieDropdownOpen;
      if (this.isCategorieDropdownOpen) {
        this.filteredCategories = [...this.categories];
        this.searchCategorie = '';
      }
    }
  }

  // Filtrer les projets en fonction de la saisie
  filterProjets(): void {
    this.filteredProjets = this.projets.filter(p =>
      p.nom.toLowerCase().includes(this.searchProjet.toLowerCase())
    );
  }

  // Lorsque l'utilisateur sélectionne un projet
  selectProjet(projet: any): void {
    this.selectedProjet = projet;
    this.isProjetDropdownOpen = false;
    // Mise à jour du formulaire réactif
    this.addTicketForm.patchValue({ projetId: projet.id });
  }

  // Filtrer les catégories en fonction de la saisie
  filterCategories(): void {
    this.filteredCategories = this.categories.filter(cat =>
      cat.nom.toLowerCase().includes(this.searchCategorie.toLowerCase())
    );
  }

  // Lorsque l'utilisateur sélectionne une catégorie
  selectCategorie(categorie: any): void {
    this.selectedCategorie = categorie;
    this.isCategorieDropdownOpen = false;
    // Mise à jour du formulaire réactif
    this.addTicketForm.patchValue({ categorieProblemeId: categorie.id });
  }

  // Gestion de la sélection d'un fichier pour l'attachement
  onFileSelected(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
      this.addTicketForm.patchValue({ attachement: this.selectedFile });
    }
  }

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
    this.selectedProjet = null;
    this.selectedCategorie = null;
  }

  // Annulation : redirige selon si des modifications ont été effectuées
  cancel(): void {
    if (this.addTicketForm.dirty) {
      if (confirm("Vous avez des modifications non sauvegardées. Voulez-vous vraiment annuler ?")) {
        this.router.navigate(['/home/Tickets']);
      }
    } else {
      this.router.navigate(['/home/Tickets']);
    }
  }

  // Gestionnaire de clic global pour fermer les dropdowns si le clic se fait en dehors
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    // Si le clic n'est pas dans un élément qui a la classe 'custom-select', fermer les dropdowns
    if (!target.closest('.custom-select')) {
      this.isProjetDropdownOpen = false;
      this.isCategorieDropdownOpen = false;
    }
  }

}
