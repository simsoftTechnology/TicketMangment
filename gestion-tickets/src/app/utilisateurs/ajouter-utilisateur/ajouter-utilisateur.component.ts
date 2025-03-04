import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { ContractDialogComponent } from '../../contract-dialog/contract-dialog.component';
import { Pays } from '../../_models/pays';
import { PaysService } from '../../_services/pays.service';
import { SocieteService } from '../../_services/societe.service';
import { Societe } from '../../_models/societe';
import { CommonModule } from '@angular/common';
import { AccountService } from '../../_services/account.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RoleService } from '../../_services/role.service';
import { Role } from '../../_models/role.model';

@Component({
    selector: 'app-ajouter-utilisateur',
    imports: [CommonModule, ReactiveFormsModule, MatTooltipModule],
    templateUrl: './ajouter-utilisateur.component.html',
    styleUrls: ['./ajouter-utilisateur.component.css']
})
export class AjouterUtilisateurComponent implements OnInit {
  registerForm: FormGroup;
  roles: Role[] = [];
  passwordVisible = false;
  confirmPasswordVisible = false;
  paysList: Pays[] = [];
  societesList: Societe[] = [];

  constructor(
    private paysService: PaysService,
    private societeService: SocieteService,
    private roleService: RoleService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private accountService: AccountService,
    private toastr: ToastrService,
    private router: Router,
  ) {
    this.registerForm = this.fb.group({
      lastName: ['', Validators.required],
      firstName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      pays: ['', Validators.required],
      role: ['', Validators.required],
      societe: [''],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(8)]],
      numTelephone: ['', [Validators.required, Validators.pattern(/^[+]\d{3}\s?\d{2}\s?\d{3}\s?\d{3}$/)]],
      confirmPassword: ['', Validators.required],
      actif: [false],
      contrat: [false],
      contract: this.fb.group({
        dateDebut: ['', Validators.required],
        dateFin: ['', Validators.required],
        type: ['Standard', Validators.required]
      })
    }, { validators: passwordMatchValidator });
  }

  ngOnInit(): void {
    // Chargement des listes de pays et de sociétés
    this.loadPays();
    this.loadSocietes();
    this.loadRoles();

    // Récupération des contrôles pour plus de lisibilité
    const contratControl = this.registerForm.get('contrat');
    const contractGroup = this.registerForm.get('contract');

    // Au démarrage, si la case 'contrat' est false, désactivez le groupe 'contract'
    if (!contratControl?.value) {
      contractGroup?.disable();
      // On retire les validateurs de chaque contrôle du groupe
      contractGroup?.get('dateDebut')?.clearValidators();
      contractGroup?.get('dateFin')?.clearValidators();
      contractGroup?.get('type')?.clearValidators();
      contractGroup?.updateValueAndValidity();
    }

    // Surveillez les changements de la sélection de la société
    this.registerForm.get('societe')?.valueChanges.subscribe(selectedSociete => {
      if (selectedSociete && selectedSociete !== '') {
        // Si une société est sélectionnée, on désactive la case 'contrat' et le groupe 'contract'
        this.registerForm.get('contrat')?.disable();
        this.registerForm.get('contrat')?.setValue(false);
        contractGroup?.disable();
        contractGroup?.get('dateDebut')?.clearValidators();
        contractGroup?.get('dateFin')?.clearValidators();
        contractGroup?.get('type')?.clearValidators();
        contractGroup?.updateValueAndValidity();
      } else {
        // Sinon, on réactive la case 'contrat'
        this.registerForm.get('contrat')?.enable();
      }
    });

    // Surveillez les changements de la case 'contrat'
    contratControl?.valueChanges.subscribe(isChecked => {
      if (isChecked) {
        // Si la case est cochée, activez le groupe 'contract' et appliquez les validateurs requis
        contractGroup?.enable();
        contractGroup?.get('dateDebut')?.setValidators(Validators.required);
        contractGroup?.get('dateFin')?.setValidators(Validators.required);
        contractGroup?.get('type')?.setValidators(Validators.required);
        // Mise à jour de la validité des contrôles du groupe
        contractGroup?.get('dateDebut')?.updateValueAndValidity();
        contractGroup?.get('dateFin')?.updateValueAndValidity();
        contractGroup?.get('type')?.updateValueAndValidity();
      } else {
        // Si la case est décochée, désactivez le groupe et retirez ses validateurs
        contractGroup?.disable();
        contractGroup?.get('dateDebut')?.clearValidators();
        contractGroup?.get('dateFin')?.clearValidators();
        contractGroup?.get('type')?.clearValidators();
        contractGroup?.updateValueAndValidity();
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
      error: (err) => {
        console.error("Erreur lors du chargement des rôles", err);
        this.toastr.error("Erreur lors du chargement des rôles.");
      }
    });
  }

  // Ouvre le dialogue pour renseigner le contrat
  onContractChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.checked) {
      this.openContractDialog();
    }
  }

  openContractDialog(): void {
    const dialogRef = this.dialog.open(ContractDialogComponent, {
      data: { 
        contractForm: this.registerForm.get('contract')
      }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        // Si le dialogue est fermé sans sauvegarder, on désactive la case à cocher contrat
        this.registerForm.get('contrat')?.setValue(false);
      }
    });
  }
  
  // Bouton "Créer" : crée l'utilisateur et redirige vers la liste
  register(): void {
    if (this.registerForm.valid) {
      const formValue = this.registerForm.value;
      const hasSociete = formValue.societe && formValue.societe !== '';

      // Construction de l'objet utilisateur à envoyer à l'API
      const userForRegister: any = {
        email: formValue.email,
        role: formValue.role.charAt(0).toUpperCase() + formValue.role.slice(1),
        firstname: formValue.firstName,
        lastname: formValue.lastName,
        numtelephone: formValue.numTelephone,
        pays: +formValue.pays,
        actif: formValue.actif,
        password: formValue.password,
        societeId: hasSociete ? +formValue.societe : null,
        contract: null
      };

      // Si la case contrat est cochée ET que l'utilisateur n'est PAS rattaché à une société
      if (formValue.contrat) {
        if (hasSociete) {
          this.toastr.error("Un utilisateur lié à une société ne peut pas créer de contrat.");
          return;
        } else {
          userForRegister.contract = {
            dateDebut: formValue.contract.dateDebut,
            dateFin: formValue.contract.dateFin,
            type: formValue.contract.type
          };
        }
      }

      console.log('Objet envoyé à l\'API :', userForRegister);
      
      this.accountService.register(userForRegister).subscribe({
        next: user => {
          this.toastr.success("Utilisateur enregistré avec succès.");
          this.router.navigate(['/home/utilisateurs'], { queryParams: { newUser: user.id } });
        },
        error: err => {
          console.error('Erreur lors de l\'enregistrement', err);
          this.toastr.error("Erreur lors de l'enregistrement de l'utilisateur.");
        }
      });
    } else {
      this.toastr.warning("Veuillez remplir correctement le formulaire.");
    }
  }
  
  // Bouton "Créer & Ajouter un autre" : crée l'utilisateur et réinitialise le formulaire
  createAndReset(): void {
    if (this.registerForm.valid) {
      const formValue = this.registerForm.value;
      const hasSociete = formValue.societe && formValue.societe !== '';
      const userForRegister: any = {
        email: formValue.email,
        role: formValue.role.charAt(0).toUpperCase() + formValue.role.slice(1),
        firstname: formValue.firstName,
        lastname: formValue.lastName,
        numtelephone: formValue.numTelephone,
        pays: +formValue.pays,
        actif: formValue.actif,
        password: formValue.password,
        societeId: hasSociete ? +formValue.societe : null,
        contract: null
      };

      if (formValue.contrat) {
        if (hasSociete) {
          this.toastr.error("Un utilisateur lié à une société ne peut pas créer de contrat.");
          return;
        } else {
          userForRegister.contract = {
            dateDebut: formValue.contract.dateDebut,
            dateFin: formValue.contract.dateFin,
            type: formValue.contract.type
          };
        }
      }

      console.log('Objet envoyé à l\'API :', userForRegister);
      
      this.accountService.register(userForRegister).subscribe({
        next: user => {
          this.toastr.success("Utilisateur enregistré avec succès. Vous pouvez ajouter un autre.");
          this.resetForm();
        },
        error: err => {
          console.error('Erreur lors de l\'enregistrement', err);
          this.toastr.error("Erreur lors de l'enregistrement de l'utilisateur.");
        }
      });
    } else {
      this.toastr.warning("Veuillez remplir correctement le formulaire.");
    }
  }

  // Méthode pour réinitialiser le formulaire à son état initial
  private resetForm(): void {
    this.registerForm.reset({
      lastName: '',
      firstName: '',
      email: '',
      pays: '',
      role: '',
      societe: '',
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
    // Réinitialiser l'état du groupe contract (désactivé et sans validateurs)
    const contractGroup = this.registerForm.get('contract');
    if (contractGroup) {
      contractGroup.disable();
      contractGroup.get('dateDebut')?.clearValidators();
      contractGroup.get('dateFin')?.clearValidators();
      contractGroup.get('type')?.clearValidators();
      contractGroup.updateValueAndValidity();
    }
  }

  // Bouton "Annuler" : si des modifications sont présentes, demander confirmation, sinon retourner à la liste
  cancel(): void {
    if (this.registerForm.dirty) {
      if (confirm("Vous avez des modifications non sauvegardées. Voulez-vous vraiment annuler ?")) {
        this.router.navigate(['/home/utilisateurs']);
      }
    } else {
      this.router.navigate(['/home/utilisateurs']);
    }
  }
  
  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  toggleConfirmPasswordVisibility(): void {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
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
