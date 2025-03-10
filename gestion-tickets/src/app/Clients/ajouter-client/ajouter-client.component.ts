import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Pays } from '../../_models/pays';
import { Societe } from '../../_models/societe';
import { PaysService } from '../../_services/pays.service';
import { AccountService } from '../../_services/account.service';
import { ContractDialogComponent } from '../../contract-dialog/contract-dialog.component';
import { CommonModule} from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SocieteService } from '../../_services/societe.service';

@Component({
  selector: 'app-ajouter-client',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatTooltipModule],
  templateUrl: './ajouter-client.component.html',
  styleUrls: ['./ajouter-client.component.css']
})
export class AjouterClientComponent implements OnInit {
  @Input() societeId!: number; // Récupéré depuis l'étape 1 du Wizard
  @Input() isWizard: boolean = false;
  @Output() clientCreated = new EventEmitter<any>();

  registerForm: FormGroup;
  paysList: Pays[] = [];
  // On n'affiche pas le sélecteur de société puisque celle-ci est fixée
  passwordVisible = false;
  confirmPasswordVisible = false;

  societesList: Societe[] = [];

  constructor(
    private fb: FormBuilder,
    private paysService: PaysService,
    private accountService: AccountService,
    private societeService: SocieteService,
    private toastr: ToastrService,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.registerForm = this.fb.group({
      lastName: ['', Validators.required],
      firstName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      pays: ['', Validators.required],
      // Le rôle est fixé à 'client'
      role: [{ value: 'client', disabled: true }, Validators.required],
      // La société est fixée via l'input; vous pouvez la cacher dans le template
      societe: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(8)]],
      numTelephone: ['', [Validators.required, Validators.pattern(/^[+]\d{3}\s?\d{2}\s?\d{3}\s?\d{3}$/)]],
      confirmPassword: ['', Validators.required],
      actif: [false],
      contrat: [false],
    }, { validators: passwordMatchValidator });
  }

  ngOnInit(): void {
    this.loadPays();
    this.loadSocietes();
  
    if (this.societeId) {
      // On fixe la société dans le formulaire
      this.registerForm.get('societe')?.setValue(this.societeId);
      
      // Récupérer la société en utilisant getSociete()
      this.societeService.getSociete(this.societeId).subscribe({
        next: (societe) => {
          // Supposons que la société possède une propriété `paysId`
          this.registerForm.get('pays')?.setValue(societe.paysId);
        },
        error: (err) => {
          console.error('Erreur lors de la récupération de la société', err);
        }
      });
    }
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
  // Méthode de création de client
  register(): void {
    if (this.registerForm.valid) {
      const formValue = this.registerForm.value;
      // L'identifiant de la société est celui passé en input
      const userForRegister: any = {
        email: formValue.email,
        role: 'Client', // fixé à Client
        firstname: formValue.firstName,
        lastname: formValue.lastName,
        numtelephone: formValue.numTelephone,
        pays: +formValue.pays,
        actif: formValue.actif,
        password: formValue.password,
        societeId: this.societeId, // Utilisation de la société créée à l'étape 1
        contract: null
      };

      if (formValue.contrat) {
        userForRegister.contract = {
          dateDebut: formValue.contract.dateDebut,
          dateFin: formValue.contract.dateFin,
          type: formValue.contract.type
        };
      }

      console.log('Objet envoyé à l’API :', userForRegister);
      
      this.accountService.register(userForRegister).subscribe({
        next: user => {
          this.toastr.success("Client enregistré avec succès.");
          if (this.isWizard) {
            // On émet l'événement pour le Wizard
            this.clientCreated.emit(user);
          } else {
            this.router.navigate(['/home/utilisateurs'], { queryParams: { newUser: user.id } });
          }
        },
        error: err => {
          console.error('Erreur lors de l’enregistrement', err);
          this.toastr.error("Erreur lors de l'enregistrement du client.");
        }
      });
    } else {
      this.toastr.warning("Veuillez remplir correctement le formulaire.");
    }
  }

  // Méthode de réinitialisation si besoin
  resetForm(): void {
    this.registerForm.reset({
      lastName: '',
      firstName: '',
      email: '',
      pays: '',
      role: 'client',
      societe: this.societeId || '',
      password: '',
      numTelephone: '',
      confirmPassword: '',
      actif: false,
      contrat: false,
      contract: {
        dateDebut: '',
        dateFin: '',
        type: 'Standard'
      }
    });
    const contractGroup = this.registerForm.get('contract');
    if (contractGroup) {
      contractGroup.disable();
      contractGroup.get('dateDebut')?.clearValidators();
      contractGroup.get('dateFin')?.clearValidators();
      contractGroup.get('type')?.clearValidators();
      contractGroup.updateValueAndValidity();
    }
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  toggleConfirmPasswordVisibility(): void {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }

  createAndReset(): void {
    if (this.registerForm.valid) {
      // Vous pouvez appeler ici la méthode register() pour créer l'utilisateur,
      // puis réinitialiser le formulaire.
      this.register();
      this.resetForm();
    } else {
      this.toastr.warning("Veuillez remplir correctement le formulaire.");
    }
  }
  
  cancel(): void {
    if (this.registerForm.dirty && !confirm("Vous avez des modifications non sauvegardées. Voulez-vous vraiment annuler ?")) {
      return;
    }
    this.router.navigate(['/home/clients']);
  }
  
}

// Validator personnalisé pour la confirmation du mot de passe
export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (password && confirmPassword && password.value !== confirmPassword.value) {
    confirmPassword.setErrors({ isMatching: true });
    return { isMatching: true };
  } else {
    if (confirmPassword?.hasError('isMatching')) {
      confirmPassword.setErrors(null);
    }
    return null;
  }
};
