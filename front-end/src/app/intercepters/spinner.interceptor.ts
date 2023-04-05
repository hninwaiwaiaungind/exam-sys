import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoaderService } from "../services/loader.service";

@Injectable()
export class SpinnerInterceptor implements HttpInterceptor {
  constructor(private readonly LoaderService: LoaderService) {
  }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const spinnerSubscription: Subscription = this.LoaderService.spinner$.subscribe();
    const userToken = localStorage.getItem('token');
    let cloned = req;
    if (userToken) {
      cloned = req.clone({
        headers: req.headers.set('Authorization', 'Bearer ' + userToken)
      });
    }
    return next
      .handle(cloned)
      .pipe(finalize(() => spinnerSubscription.unsubscribe()));
  }
}
