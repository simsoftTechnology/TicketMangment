import { Component, inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { AccountService } from '../_services/account.service';
import { Router } from '@angular/router';
import { NgClass, NgIf } from '@angular/common';
import { LoaderService } from '../_services/loader.service';

@Component({
    selector: 'app-login',
    imports: [NgClass, NgIf, ReactiveFormsModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
  
  private fb = inject(FormBuilder);

  constructor(
    
    private router: Router,
    public accountService: AccountService,
    private loaderService: LoaderService
  ) {
    this.loaderService.isLoading$.subscribe((loading) => {
      this.isLoading = loading;
    });
  }
  
  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  formSubmitted = false; 
  loginError: { email?: string; password?: string } = {}; // Variable pour stocker l'erreur d'authentification
  passwordVisible: boolean = false;  // Variable pour contrôler la visibilité du mot de passe

  isLoading: boolean = false;

  login() {
    this.formSubmitted = true; 
    this.loginError = {}; // Réinitialisation des erreurs
    
    if (this.loginForm.invalid) {
      return;
    }
    this.loaderService.showLoader();

    this.accountService.login(this.loginForm.value).subscribe({
      next: () => {
        this.router.navigateByUrl('/home/dashboard');
        this.loaderService.hideLoader();
      },
      error: (error) => {
        // Supposons que le backend renvoie une erreur Unauthorized avec le message dans error.error.message
        const errorMsg = error.error?.message || 'Erreur inconnue';
        this.loaderService.hideLoader();
        // Déduire le type d'erreur en se basant sur le contenu du message
        if (errorMsg.toLowerCase().includes('e-mail')) {
          this.loginError.email = errorMsg;
        } else if (errorMsg.toLowerCase().includes('mot de passe')) {
          this.loginError.password = errorMsg;
        } else {
          // Affecter par défaut à email ou afficher un message général
          this.loginError.email = errorMsg;
        }
        
        console.error('Erreur interceptée :', error);
      },
    });
  }
  
  

   // Fonction pour basculer la visibilité du mot de passe
   togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;  // Toggle entre true et false
  }
  
}

