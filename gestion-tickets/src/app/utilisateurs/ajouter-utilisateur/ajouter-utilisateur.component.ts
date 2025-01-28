import { Component, inject, OnInit, output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AccountService } from '../../_services/account.service';
import { CommonModule } from '@angular/common';
import { Pays } from '../../_models/pays';
import { TextInputComponent } from '../../_forms/text-input/text-input.component';

@Component({
  selector: 'app-ajouter-utilisateur',
  standalone: true,
  imports: [ ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './ajouter-utilisateur.component.html',
  styleUrl: './ajouter-utilisateur.component.css'
})
export class AjouterUtilisateurComponent implements OnInit {
  private accountService = inject(AccountService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  cancelRegister = output<boolean>();
  registerForm: FormGroup = new FormGroup({});
  validationErrors: string[] | undefined;
  paysList: Pays[] = [];


  passwordVisible = false;  // Contrôle la visibilité du mot de passe
  confirmPasswordVisible = false;  // Contrôle la visibilité de la confirmation du mot de passe

  

  ngOnInit(): void {
    this.initializeForm();
    this.loadPays();
  }

  initializeForm() {
    this.registerForm = this.fb.group({
      societe: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      pays: [null, Validators.required],
      numTelephone: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[+]?[\d\s-]{6,15}$/), // Numéro de téléphone valide : peut inclure "+" au début, chiffres, espaces, tirets
        ],
      ],
      role: ['', Validators.required],
      actif: [false],
      contrat: [false],
      password: ['', [Validators.required, Validators.minLength(6), 
          Validators.maxLength(8)]],
      confirmPassword: ['', [Validators.required, this.matchValues('password')]],
    });
    this.registerForm.controls['password'].valueChanges.subscribe({
      next: () => this.registerForm.controls['confirmPassword'].updateValueAndValidity()
    })
  }

  matchValues(matchTo: string): ValidatorFn {
    return (control: AbstractControl) => {
      return control.value === control.parent?.get(matchTo)?.value ? null : {isMatching: true}
    }
  }

  register() {
    if (this.registerForm.invalid) {
      console.log('Formulaire invalide', this.registerForm.errors);
      return;
    }

    console.log('Pays sélectionné :', this.registerForm.value.pays);

    const paysId = +this.registerForm.value.pays;
    if (!paysId) {
      console.error('Erreur : sélectionnez un pays valide');
      return;
    }
  
    const formData = {
      email: this.registerForm.value.email,
      role: this.registerForm.value.role,
      firstname: this.registerForm.value.firstName,
      lastname: this.registerForm.value.lastName,
      numtelephone: this.registerForm.value.numTelephone,
      pays: paysId,
      actif: this.registerForm.value.actif,
      password: this.registerForm.value.password
    };

    console.log('Données envoyées :', formData);

  
    this.accountService.register(formData).subscribe({
      next: _ => this.router.navigateByUrl('/utilisateurs'),
      error: error => this.validationErrors = error
    });
  }


  
  loadPays() {
    this.accountService.getPays().subscribe({
      next: (pays: Pays[]) => this.paysList = pays,
      error: (err) => console.error('Erreur lors de la récupération des pays', err)
    });
  }  
  
   // Méthodes pour basculer la visibilité du mot de passe
   togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  toggleConfirmPasswordVisibility(): void {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }
  

  
}