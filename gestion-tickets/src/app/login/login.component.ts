import { Component, inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { AccountService } from '../_services/account.service';
import { Router } from '@angular/router';
import { NgClass, NgIf } from '@angular/common';

@Component({
    selector: 'app-login',
    imports: [NgClass, NgIf, ReactiveFormsModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
  accountService = inject(AccountService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  formSubmitted = false; 
  loginError: { email?: string; password?: string } = {}; // Variable pour stocker l'erreur d'authentification
  passwordVisible: boolean = false;  // Variable pour contrôler la visibilité du mot de passe

  login() {
    this.formSubmitted = true; 
    this.loginError = {}; // Réinitialisation des erreurs
    

  
    if (this.loginForm.invalid) {
      return;
    }
  
    this.accountService.login(this.loginForm.value).subscribe({
      next: () => {
        this.router.navigateByUrl('/home/TableauDeBord');
      },
      error: (error) => {
        if (error.errorType === 'email') {
          this.loginError.email = error.message; // Erreur spécifique à l'e-mail
          console.log('Erreur interceptée :', error);
        } else if (error.errorType === 'password') {
          this.loginError.password = error.message; // Erreur spécifique au mot de passe
          console.log('Erreur interceptée :', error);
        } else {
          console.error('Erreur inconnue:', error);
        }
      },
    });
  }

   // Fonction pour basculer la visibilité du mot de passe
   togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;  // Toggle entre true et false
  }
  
}

