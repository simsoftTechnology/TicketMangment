import { ContratService } from './../../_services/contrat.service';
import { Component, OnInit, Pipe } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../../_services/account.service';
import { User } from '../../_models/user';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { PaginatedResult } from '../../_models/pagination';
import { Projet } from '../../_models/Projet';
import { Ticket } from '../../_models/ticket';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { PipesModule } from '../../_pipes/pipes.module';
import { Pays } from '../../_models/pays';
import { Societe } from '../../_models/societe';
import { PaysService } from '../../_services/pays.service';
import { SocieteService } from '../../_services/societe.service';
import { ToastrService } from 'ngx-toastr';
import { DefaultPipe } from '../../_pipes/default.pipe';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { ProjetService } from '../../_services/projet.service';
import { Role } from '../../_models/role.model';
import { RoleService } from '../../_services/role.service';
import { StatutDesTicket } from '../../_models/statut-des-ticket.model';
import { Priorite } from '../../_models/priorite.model';
import { StatusService } from '../../_services/status.service';
import { PrioriteService } from '../../_services/priorite.service';
import { MatDialog } from '@angular/material/dialog';
import { AttachProjectDialogComponent } from '../attach-project-dialog/attach-project-dialog.component';

@Component({
  selector: 'app-details-utilisateur',
  imports: [FormsModule, NgIf, NgFor, CommonModule, PipesModule, ReactiveFormsModule, DefaultPipe],
  templateUrl: './details-utilisateur.component.html',
  styleUrls: ['./details-utilisateur.component.css']
})
export class DetailsUtilisateurComponent implements OnInit {
  private user: User | null = null;  // stocke les données utilisateur récupérées
  activeTab: string = 'projets';
  userForm!: FormGroup;
  contratForm!: FormGroup;

  // Projets
  displayedProjects: Projet[] = [];
  projectSearchTerm: string = '';
  projetPageNumber: number = 1;
  projetPageSize: number = 5;
  totalProjets: number = 0;

  // Tickets
  displayedTickets: Ticket[] = [];
  ticketSearchTerm: string = '';
  ticketPageNumber: number = 1;
  ticketPageSize: number = 5;
  totalTickets: number = 0;

  passwordVisible = false;
  confirmPasswordVisible = false;
  paysList: Pays[] = [];
  societesList: Societe[] = [];

  roles: Role[] = [];
  statuses: StatutDesTicket[] = [];
  priorities: Priorite[] = [];

  constructor(
    private paysService: PaysService,
    private societeService: SocieteService,
    private route: ActivatedRoute,
    private accountService: AccountService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private router: Router,
    private projetService: ProjetService,
    private contratService: ContratService,
    private roleService: RoleService,
    private statusService: StatusService,
    private prioriteService: PrioriteService,
    private dialog: MatDialog
  ) { }

  // Getter pour exposer l'utilisateur dans le template sous le nom "userDetails"
  get userDetails(): User | null {
    return this.user;
  }

  private ticketSearchSubject = new Subject<string>();

  ngOnInit(): void {
    this.loadPays();
    this.loadSocietes();
    this.loadRoles();
    this.loadStatuses();
    this.loadPriorities();

    this.ticketSearchSubject.pipe(
      debounceTime(300),          // Attendre 300ms de pause
      distinctUntilChanged()      // Émettre uniquement si la valeur change
    ).subscribe(searchTerm => {
      this.ticketSearchTerm = searchTerm;
      this.ticketPageNumber = 1;
      this.loadTickets();
    });
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId) {
      this.loadUserDetails(+userId);
    }
    this.initForm();
    this.initContratForm();
  }



  openAttachProjectDialog(): void {
    const dialogRef = this.dialog.open(AttachProjectDialogComponent, {});
  
    dialogRef.afterClosed().subscribe(result => {
      if (result && this.user) {
        this.projetService.ajouterUtilisateurAuProjet(
          result.projetId,
          this.user.id,
        ).subscribe({
          next: () => {
            this.toastr.success('Projet attaché avec succès');
            this.loadProjects();
          },
          error: (err) => {
            let errorMsg = "Erreur lors de l'attachement du projet";
            // Vérifiez si le statut est 409 (conflit) et si un message est retourné par le backend
            if (err.status === 409) {
              // Parfois err.error peut être une chaîne ou un objet contenant "message"
              if (err.error) {
                errorMsg = typeof err.error === 'string' ? err.error : err.error.message || errorMsg;
              }
            }
            this.toastr.error(errorMsg);
          }
        });
      }
    });
  }
  
  
  

  loadPays(): void {
    this.paysService.getPays().subscribe({
      next: (pays: Pays[]) => this.paysList = pays,
      error: (err) => {
        console.error('Erreur lors de la récupération des pays', err);
        this.toastr.error("Erreur lors du chargement des pays.");
      }
    });
  }

  loadSocietes(): void {
    this.societeService.getSocietes().subscribe({
      next: (societes: Societe[]) => this.societesList = societes,
      error: (err) => {
        console.error('Erreur lors de la récupération des sociétés', err);
        this.toastr.error("Erreur lors du chargement des sociétés.");
      }
    });
  }

  loadRoles(): void {
    this.roleService.getRoles().subscribe({
      next: (roles: Role[]) => {
        this.roles = roles;
      },
      error: (error) => {
        console.error("Erreur lors du chargement des rôles", error);
        this.toastr.error("Erreur lors du chargement des rôles.");
      }
    });
  }

  private loadStatuses(): void {
    this.statusService.getStatuses().subscribe({
      next: (statuses) => this.statuses = statuses,
      error: (err) => console.error('Erreur chargement statuts', err)
    });
  }

  private loadPriorities(): void {
    this.prioriteService.getPriorites().subscribe({
      next: (priorities) => this.priorities = priorities,
      error: (err) => console.error('Erreur chargement priorités', err)
    });
  }

  getStatusName(statusId: number): string {
    return this.statuses.find(s => s.id === statusId)?.name || 'Inconnu';
  }

  getPriorityName(priorityId: number): string {
    return this.priorities.find(p => p.id === priorityId)?.name || 'Inconnu';
  }

  initForm(): void {
    this.userForm = this.fb.group({
      id: [null],
      lastName: ['', Validators.required],
      firstName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      pays: ['', Validators.required],
      role: ['', Validators.required],
      societe: [''],
      // Ces champs sont optionnels, à renseigner uniquement si l’utilisateur souhaite changer son mot de passe
      nouveauPassword: ['', [Validators.minLength(6), Validators.maxLength(8)]],
      confirmNouveauPassword: [''],
      numTelephone: ['', [Validators.required, Validators.pattern(/^[+]\d{3}\s?\d{2}\s?\d{3}\s?\d{3}$/)]],
      actif: [false]
    }, { validators: newPasswordMatchValidator });
  }



  initContratForm(): void {
    this.contratForm = this.fb.group({
      id: [0], // Ajoutez ce contrôle pour stocker l'identifiant du contrat
      dateDebut: ['', Validators.required],
      dateFin: ['', Validators.required],
      type: ['', Validators.required]
    });
  }


  loadUserDetails(userId: number): void {
    this.accountService.getUser(userId).subscribe({
      next: (user) => {
        this.user = user;
        // Remplir le formulaire de l'utilisateur
        this.userForm.patchValue({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role?.toLowerCase(),
          pays: user.pays,              // Ajout du pays
          societe: user.societeId,       // Ajout de la société (vérifiez le nom du champ)
          numTelephone: user.numTelephone, // Ajout du numéro de téléphone
          actif: user.actif              // Ajout de l'état actif
        });
        // Si un contrat existe, remplir également le formulaire du contrat
        if (user.contrat) {
          this.contratForm.patchValue({
            id: user.contrat.id, // Assurez-vous de patcher l'identifiant du contrat
            dateDebut: user.contrat.dateDebut
              ? new Date(user.contrat.dateDebut + 'Z').toISOString().substring(0, 10)
              : '',
            dateFin: user.contrat.dateFin
              ? new Date(user.contrat.dateFin + 'Z').toISOString().substring(0, 10)
              : '',
            type: user.contrat.type
          });
        }
        this.loadProjects();
        this.loadTickets();
      },
      error: (error) =>
        console.error("Erreur lors du chargement de l'utilisateur", error)
    });
  }


  // Mise à jour de l'utilisateur
  onSubmit(): void {
    // Vérifier si l'utilisateur a modifié au moins un champ
    if (!this.userForm.dirty) {
      this.toastr.warning("Veuillez modifier au moins un champ.");
      return;
    }
    // Si le formulaire est invalide, affiche un message d'erreur
    if (this.userForm.invalid) {
      this.toastr.error("Veuillez corriger les erreurs du formulaire.");
      return;
    }

    const updatedUser: User = this.userForm.value;
    this.accountService.updateUser(updatedUser).subscribe({
      next: () => {
        // Mise à jour locale de la variable utilisateur
        this.user = { ...this.user, ...updatedUser };
        this.toastr.success("Mise à jour effectuée avec succès.");
      },
      error: (error) => {
        console.error("Erreur lors de la mise à jour", error);
        this.toastr.error("Erreur lors de la mise à jour de l'utilisateur.");
      }
    });
  }


  onCancel(): void {
    // Réinitialiser le formulaire avec les valeurs initiales si nécessaire
    if (this.user) {
      this.userForm.patchValue({
        lastName: this.user.lastName,
        firstName: this.user.firstName,
        email: this.user.email,
        pays: this.user.pays,
        role: this.user.role,
        societe: this.user.societeId,
        numTelephone: this.user.numTelephone,
        actif: this.user.actif
        // Les champs de mot de passe restent vides
      });
    }
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  toggleConfirmPasswordVisibility(): void {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }
  // Méthodes pour le contrat

  onSubmitContrat(): void {
    // Vérifier que l'utilisateur est chargé et qu'il a un contrat
    if (!this.user) {
      this.toastr.error("Aucun utilisateur n'est chargé.");
      return;
    }
    if (!this.user.contrat) {
      this.toastr.error("Aucun contrat trouvé pour cet utilisateur.");
      return;
    }

    // Vérifier si au moins un champ du contrat a été modifié
    if (!this.contratForm.dirty) {
      this.toastr.warning("Veuillez modifier au moins un champ du contrat.");
      return;
    }

    // Vérifier que le formulaire est valide
    if (this.contratForm.invalid) {
      this.toastr.error("Veuillez corriger les erreurs du formulaire de contrat.");
      return;
    }

    // Fusionner l'objet contrat original avec les valeurs du formulaire pour conserver les valeurs non modifiées
    const originalContrat = this.user.contrat;
    const contratToUpdate = {
      ...originalContrat,      // Conserve toutes les valeurs actuelles (ClientId, SocietePartenaireId, etc.)
      ...this.contratForm.value // Écrase uniquement les valeurs modifiées (dateDebut, dateFin, type, etc.)
    };

    // Appel au service en utilisant l'ID du contrat (et non l'ID de l'utilisateur)
    this.contratService.updateContract(contratToUpdate.id, contratToUpdate).subscribe({
      next: () => {
        this.toastr.success("Contrat mis à jour avec succès.");
        // Mettre à jour l'objet contrat de l'utilisateur localement
        if (this.user) {
          this.user.contrat = contratToUpdate;
        }

        console.log("Contrat mis à jour :", contratToUpdate);
      },
      error: (error) => {
        console.error("Erreur lors de la mise à jour du contrat", error);
        this.toastr.error("Erreur lors de la mise à jour du contrat.");
      }
    });
  }



  cancelContrat(): void {
    if (this.user && this.user.contrat) {
      this.contratForm.patchValue({
        dateDebut: this.user.contrat.dateDebut,
        dateFin: this.user.contrat.dateFin,
        type: this.user.contrat.type
      });
    }
  }

  initializeContratForm(): void {
    this.initContratForm();
  }

  // Chargement des projets associés à l'utilisateur
  loadProjects(): void {
    if (!this.user) return;

    this.accountService
      .getUserProjects(this.user.id, this.projetPageNumber, this.projetPageSize, this.projectSearchTerm)
      .subscribe((res: PaginatedResult<Projet[]>) => {
        this.displayedProjects = res.items || [];
        this.totalProjets = res.pagination?.totalItems || 0;
      });
  }

  // Chargement des tickets associés à l'utilisateur
  loadTickets(): void {
    if (!this.user) return;

    this.accountService
      .getUserTickets(this.user.id, this.ticketPageNumber, this.ticketPageSize, this.ticketSearchTerm)
      .subscribe((res: PaginatedResult<Ticket[]>) => {
        this.displayedTickets = res.items || [];
        this.totalTickets = res.pagination?.totalItems || 0;
      });
  }

  getProjectRole(projectId: number): string {
    const member = this.user?.projetMembers?.find(m => m.projetId === projectId);
    return member ? member.role : 'Non défini';
  }

  switchTab(tab: string): void {
    this.activeTab = tab;
    if (tab === 'projets') {
      this.loadProjects();
    } else if (tab === 'tickets') {
      this.loadTickets();
    }
  }

  onProjectSearch(): void {
    this.projetPageNumber = 1;
    this.loadProjects();
  }

  onTicketSearch(): void {
    this.ticketPageNumber = 1;
    this.loadTickets();
  }


  viewProjet(projectId: number): void {
    // Redirection vers la page de détails du projet
    this.router.navigate(['home/Projets/details/', projectId]);
  }


  onDeleteUserFromProject(projetId: number): void {
    if (!this.user) return; // Vérification si l'utilisateur est chargé

    const firstName = this.user.firstName;
    const lastName = this.user.lastName;
    if (confirm(`Êtes-vous sûr de vouloir supprimer "${firstName} ${lastName}" de ce projet ?`)) {
      this.projetService.supprimerUtilisateurDuProjet(projetId, this.user.id).subscribe({
        next: () => {
          this.toastr.success(`${firstName} ${lastName} a été retiré du projet.`);
          this.loadProjects(); // Recharge la liste des projets
        },
        error: (error) => {
          console.error('Erreur lors de la suppression du projet', error);
          this.toastr.error('Une erreur est survenue lors de la suppression.');
        }
      });
    }
  }


}

export const newPasswordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const nouveauPassword = control.get('nouveauPassword');
  const confirmNouveauPassword = control.get('confirmNouveauPassword');

  // Si aucun des deux n'est renseigné, pas d'erreur (le changement de mot de passe est optionnel)
  if (!nouveauPassword?.value && !confirmNouveauPassword?.value) {
    return null;
  }

  return nouveauPassword && confirmNouveauPassword && nouveauPassword.value !== confirmNouveauPassword.value
    ? { passwordMismatch: true }
    : null;
};

