import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { errorInterceptor } from './_interceptors/error.interceptor';
import { jwtInterceptor } from './_interceptors/jwt.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }),
  provideRouter(routes),
  provideHttpClient(withInterceptors([jwtInterceptor, errorInterceptor])),
  provideAnimations(),
  provideToastr({
    positionClass: 'toast-bottom-right',
    timeOut: 5000, // Durée d'affichage en ms (5 secondes)
    closeButton: true,
    progressAnimation: 'increasing',
  }),
  ]
};
