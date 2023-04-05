import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { finalize, Observable, Subscription } from 'rxjs';
import { StorageService } from '../services/storage.service';
import { LoggedUser } from '../interfaces/model';
import { LoaderService } from './loader.service';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptorService implements HttpInterceptor {

  constructor(
    private storageSvc: StorageService,
    private LoaderService: LoaderService
  ) { }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const user: LoggedUser = this.storageSvc.getData('user');
    const spinnerSubscription: Subscription = this.LoaderService.spinner$.subscribe();
    const apiKey = user.apiKey;
    let cloned = req;
    if (apiKey) {
      cloned = req.clone({
        headers: req.headers.set('Authorization', 'Bearer ' + apiKey)
      });
    }
    return next.handle(cloned).pipe(finalize(() => spinnerSubscription.unsubscribe()));
  }
}