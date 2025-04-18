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
import { LoaderService } from '../../_services/loader.service';
import { ConfirmModalComponent } from '../../confirm-modal/confirm-modal.component';
import { OverlayModalService } from '../../_services/overlay-modal.service';

@Component({
  selector: 'app-ajouter-utilisateur',
  imports: [CommonModule, ReactiveFormsModule, MatTooltipModule],
  templateUrl: './ajouter-utilisateur.component.html',
  styleUrls: ['./ajouter-utilisateur.component.scss']
})
export class AjouterUtilisateurComponent implements OnInit {
  registerForm: FormGroup;
  roles: Role[] = [];
  passwordVisible = false;
  confirmPasswordVisible = false;
  paysList: Pays[] = [];
  societesList: Societe[] = [];
  selectedCountry: Pays | undefined;
  isLoading: boolean = false;

  constructor(
    private paysService: PaysService,
    private societeService: SocieteService,
    private roleService: RoleService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private accountService: AccountService,
    private toastr: ToastrService,
    private router: Router,
    private loaderService: LoaderService,
    private overlayModalService: OverlayModalService,
  ) {
    this.loaderService.isLoading$.subscribe((loading) => {
      this.isLoading = loading;
    });
    this.registerForm = this.fb.group({
      lastName: ['', Validators.required],
      firstName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      pays: ['', Validators.required],
      role: ['', Validators.required],
      societe: [{ value: '', disabled: true }],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(16)]],
      numTelephone: ['', [
        Validators.required,
        Validators.pattern(/^[0-9\s]+$/),
        Validators.minLength(8),
        Validators.maxLength(10)
      ]],
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
    // Chargement des listes
    this.loadPays();
    this.loadSocietes();
    this.loadRoles();

    this.registerForm.get('pays')?.valueChanges.subscribe(value => {
      this.selectedCountry = this.paysList.find(p => p.idPays === +value);
    });

    // Activer/désactiver le champ société selon le rôle
    this.registerForm.get('role')?.valueChanges.subscribe(role => {
      const societeControl = this.registerForm.get('societe');
      if (role && role.toLowerCase() === 'client') {
        societeControl?.enable();
        societeControl?.setValidators(Validators.required);
      } else {
        societeControl?.disable();
        societeControl?.clearValidators();
        societeControl?.setValue('');
      }
      societeControl?.updateValueAndValidity();
    });

    // Initialisation du groupe 'contract' selon la case 'contrat'
    const contratControl = this.registerForm.get('contrat');
    const contractGroup = this.registerForm.get('contract');

    if (!contratControl?.value) {
      contractGroup?.disable();
      contractGroup?.get('dateDebut')?.clearValidators();
      contractGroup?.get('dateFin')?.clearValidators();
      contractGroup?.get('type')?.clearValidators();
      contractGroup?.updateValueAndValidity();
    }

    // Désactivation conditionnelle supprimée : la case contrat reste activée, quelle que soit la valeur du champ société.
    this.registerForm.get('societe')?.valueChanges.subscribe(() => {
      // On laisse la case 'contrat' active
      this.registerForm.get('contrat')?.enable();
    });

    // Surveillance de la case 'contrat'
    contratControl?.valueChanges.subscribe(isChecked => {
      if (isChecked) {
        contractGroup?.enable();
        contractGroup?.get('dateDebut')?.setValidators(Validators.required);
        contractGroup?.get('dateFin')?.setValidators(Validators.required);
        contractGroup?.get('type')?.setValidators(Validators.required);
        contractGroup?.get('dateDebut')?.updateValueAndValidity();
        contractGroup?.get('dateFin')?.updateValueAndValidity();
        contractGroup?.get('type')?.updateValueAndValidity();
      } else {
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

  onContractChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.checked) {
      this.openContractDialog();
    }
  }

  openContractDialog(): void {
    const dialogRef = this.dialog.open(ContractDialogComponent, {
      data: { contractForm: this.registerForm.get('contract') }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        // Si annulé, décocher la case
        this.registerForm.get('contrat')?.setValue(false);
      }
    });
  }

  register(): void {
    if (this.registerForm.valid) {
      const formValue = this.registerForm.value;
      const hasSociete = formValue.societe && formValue.societe !== '';

      const phoneNumber = formValue.numTelephone;
      const fullPhoneNumber = this.selectedCountry
        ? this.selectedCountry.codeTel + ' ' + phoneNumber
        : phoneNumber;

      const userForRegister: any = {
        email: formValue.email,
        role: formValue.role.charAt(0).toUpperCase() + formValue.role.slice(1),
        firstname: this.accountService.removeSpecial(formValue.firstName),
        lastname: this.accountService.removeSpecial(formValue.lastName),
        numtelephone: fullPhoneNumber,
        pays: +formValue.pays,
        actif: formValue.actif,
        password: formValue.password,
        societeId: hasSociete ? +formValue.societe : null,
        contract: null
      };

      if (formValue.contrat) {
        userForRegister.contract = {
          dateDebut: formValue.contract.dateDebut,
          dateFin: formValue.contract.dateFin,
          type: formValue.contract.type
        };
      }

      this.loaderService.showLoader();

      this.accountService.register(userForRegister).subscribe({
        next: user => {
          this.toastr.success("Utilisateur enregistré avec succès.");
          this.loaderService.hideLoader();
          this.router.navigate(['/home/utilisateurs'], { queryParams: { newUser: user.id } });
        },
        error: err => {
          console.error('Erreur lors de l\'enregistrement', err);
          const errorMessage = err.error?.message || err.message || "Erreur lors de l'enregistrement de l'utilisateur.";
          this.toastr.error(errorMessage);
          this.loaderService.hideLoader();
        }
      });
    } else {
      this.toastr.warning("Veuillez remplir correctement le formulaire.");
    }
  }

  cancel(): void {
    if (this.registerForm.dirty) {
      const modalInstance = this.overlayModalService.open(ConfirmModalComponent);
      modalInstance.message = "Vous avez des modifications non sauvegardées. Voulez-vous vraiment annuler ?";

      modalInstance.confirmed.subscribe(() => {
        this.router.navigate(['/home/utilisateurs']);
        this.overlayModalService.close();
      });

      modalInstance.cancelled.subscribe(() => {
        this.overlayModalService.close();
      });
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
