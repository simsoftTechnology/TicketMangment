import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AccountService } from '../_services/account.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  // Injection du Router et du AccountService
  const router = inject(Router);
  const accountService = inject(AccountService);

  return next(req).pipe(
    catchError(error => {
      if (error) {
        switch (error.status) {
          case 400:
            if (error.error.errors) {
              const modalStateErrors = [];
              for (const key in error.error.errors) {
                if (error.error.errors[key]) {
                  modalStateErrors.push(error.error.errors[key]);
                }
              }
              throw modalStateErrors.flat();
            } else {
              return throwError(() => error.error);
            }
          case 401:
            // Nettoyer le local storage en appelant la méthode logout()
            accountService.logout();
            // Rediriger l'utilisateur vers la page de login
            router.navigateByUrl('/login');
            return throwError(() => error);
          case 404:
            router.navigateByUrl('/not-found');
            break;
          case 500:
            router.navigateByUrl('/server-error', { state: { error: error.error } });
            break;
          default:
            return throwError(() => ({ message: 'Un problème inattendu est survenu.' }));
        }
      }
      return throwError(() => error);
    })
  );
};
