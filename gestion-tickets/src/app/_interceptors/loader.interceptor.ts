import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, finalize } from 'rxjs';
import { LoaderService } from '../_services/loader.service';

@Injectable()
export class LoaderInterceptor implements HttpInterceptor {
  constructor(private loaderService: LoaderService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Si l'en-tête X-Skip-Loader est présent et vaut 'true', on ignore le loader global.
    const skipLoader = req.headers.get('X-Skip-Loader') === 'true';

    if (!skipLoader) {
      this.loaderService.showLoader();
    }

    return next.handle(req).pipe(
      finalize(() => {
        if (!skipLoader) {
          this.loaderService.hideLoader();
        }
      })
    );
  }
}
