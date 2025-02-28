import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AccountService } from '../_services/account.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const accountService = inject(AccountService);
  
  // Exclure le login de l'ajout du token
  if (!req.url.includes('/account/login') && accountService.currentUser()) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${accountService.currentUser()?.token}`
      }
    });
  } else {
    console.warn('Aucun token trouvé ou endpoint login, pas d\'Authorization.');
  }
  
  return next(req);
};

