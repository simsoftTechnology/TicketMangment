import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
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
            return throwError(() => ({
              errorType: error.error.errorType,
              message: error.error.message,
            }));
          case 404:
            inject(Router).navigateByUrl('/not-found');
            break;
          case 500:
            inject(Router).navigateByUrl('/server-error', { state: { error: error.error } });
            break;
          default:
            return throwError(() => ({ message: 'Un problème inattendu est survenu.' }));
        }
      }
      return throwError(() => error);
    })
  );
};
