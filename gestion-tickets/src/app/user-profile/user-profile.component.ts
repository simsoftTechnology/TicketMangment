import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn, ReactiveFormsModule } from '@angular/forms';
import { User } from '../_models/user';
import { AccountService } from '../_services/account.service';
import { PaysService } from '../_services/pays.service';
import { SocieteService } from '../_services/societe.service';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { LoaderService } from '../_services/loader.service';
import { GlobalLoaderService } from '../_services/global-loader.service';

// Validateur personnalisé pour vérifier que 'nouveauPassword' et 'confirmNouveauPassword' correspondent
export const newPasswordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const nouveauPassword = control.get('nouveauPassword');
  const confirmNouveauPassword = control.get('confirmNouveauPassword');
  if (!nouveauPassword?.value && !confirmNouveauPassword?.value) {
    return null;
  }
  return (nouveauPassword && confirmNouveauPassword && nouveauPassword.value !== confirmNouveauPassword.value)
    ? { passwordMismatch: true }
    : null;
};

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  userDetails: User | null = null;
  userForm!: FormGroup;
  passwordVisible: boolean = false;
  confirmPasswordVisible: boolean = false;

  // Liste des pays chargée via PaysService
  paysList: any[] = [];
  // Propriété pour afficher le drapeau et le code téléphone
  selectedCountry: any = null;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private paysService: PaysService,
    private toastr: ToastrService,
    private loaderService: LoaderService,
    private globalLoaderService: GlobalLoaderService
  ) {
    this.loaderService.isLoading$.subscribe(loading => {
      this.isLoading = loading;
    });
  }

  ngOnInit(): void {
    this.globalLoaderService.showGlobalLoader();
    this.initForm();
    // Charger la liste des pays avant de charger l'utilisateur
    this.paysService.getPays().subscribe({
      next: (pays) => {
        this.paysList = pays;
        this.loadUserDetails();
        this.globalLoaderService.hideGlobalLoader();
      },
      error: (err) => {
        console.error("Erreur lors du chargement des pays", err);
      }
    });
  }

  initForm(): void {
    this.userForm = this.fb.group({
      id: [null],
      lastName: ['', Validators.required],
      firstName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      // Champs en lecture seule
      pays: [{ value: '', disabled: true }, Validators.required],
      role: [{ value: '', disabled: true }, Validators.required],
      societe: [{ value: '', disabled: true }], // affichera le nom de la société directement
      // Changement de mot de passe (optionnel)
      nouveauPassword: ['', [Validators.minLength(8), Validators.maxLength(16)]],
      confirmNouveauPassword: [''],
      numTelephone: ['', [
        Validators.required,
        Validators.pattern(/^[0-9\s]+$/),
        Validators.minLength(8),
        Validators.maxLength(10)
      ]],
      actif: [false]
    }, { validators: newPasswordMatchValidator });
  }

  // Convertit l'ID d'un pays en son nom
  getPaysName(paysId: string | number | undefined): string {
    if (paysId === undefined) {
      return '';
    }
    const id = Number(paysId);
    const pays = this.paysList.find(p => p.idPays === id);
    return pays ? pays.nom : '';
  }


  loadUserDetails(): void {
    this.globalLoaderService.showGlobalLoader();

    this.userDetails = this.accountService.currentUser();
    if (this.userDetails) {
      // Récupérer le pays sélectionné
      const country = this.paysList.find(p => p.idPays === Number(this.userDetails!.pays));
      // Code téléphonique du pays (ex: "+216")
      const codeTel = country?.codeTel || '';
      let localNumber = this.userDetails.numTelephone || '';

      // Si le numéro commence par le code, le retirer
      if (codeTel && localNumber.startsWith(codeTel)) {
        localNumber = localNumber.substring(codeTel.length).trim();
      }

      // Mettre à jour le formulaire avec le numéro local
      this.userForm.patchValue({
        id: this.userDetails.id,
        lastName: this.userDetails.lastName,
        firstName: this.userDetails.firstName,
        email: this.userDetails.email,
        pays: this.userDetails.pays,
        role: this.userDetails.role,
        societe: this.userDetails.societe && this.userDetails.societe.nom ? this.accountService.removeSpecial(this.userDetails.societe.nom) : this.accountService.removeSpecial('Aucune société'),
        numTelephone: localNumber,
        actif: this.userDetails.actif
      });
      this.selectedCountry = country;
    }

    this.globalLoaderService.hideGlobalLoader();
  }


  onSubmit(): void {
    if (!this.userForm.dirty) {
      this.toastr.warning("Veuillez modifier au moins un champ.");
      return;
    }
    if (this.userForm.invalid) {
      this.toastr.error("Veuillez corriger les erreurs du formulaire.");
      return;
    }
  
    // Affiche le loader
    this.loaderService.showLoader();
  
    // Récupérer toutes les valeurs (même celles désactivées)
    const updatedUser: User = this.userForm.getRawValue();
    updatedUser.firstName= this.accountService.removeSpecial(this.userForm.value.firstName);
    updatedUser.lastName= this.accountService.removeSpecial(this.userForm.value.lastName);
 
   
    console.log(updatedUser);

    this.accountService.updateUser(updatedUser).subscribe({
      next: () => {
        // Conserver le token de l'utilisateur existant
        const mergedUser: User = {
          ...this.userDetails!,
          ...updatedUser,
          token: this.userDetails?.token || ''
        };
        
  
        // Mettre à jour le local storage et le signal
        this.accountService.setCurrentUser(mergedUser);
  
        // Mettre à jour la variable locale
        this.userDetails = mergedUser;
        this.toastr.success("Mise à jour effectuée avec succès.");
        this.loaderService.hideLoader();
      },
      error: (error) => {
        console.error("Erreur lors de la mise à jour", error);
        this.toastr.error("Erreur lors de la mise à jour", error);
        this.loaderService.hideLoader();
      }
    });
  }


  onCancel(): void {
    
    if (this.userDetails) {
      this.userForm.patchValue({
        lastName: this.userDetails.lastName,
        firstName: this.userDetails.firstName,
        email: this.userDetails.email,
        // Utilisez l'ID original et non le nom du pays :
        pays: this.userDetails.pays,
        role: this.userDetails.role,
        societe: this.userDetails.societe && this.userDetails.societe.nom ? this.userDetails.societe.nom : this.accountService.removeSpecial('Aucune société'),
        numTelephone: this.userDetails.numTelephone,
        actif: this.userDetails.actif
      });
    }
  }


  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  toggleConfirmPasswordVisibility(): void {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }
}