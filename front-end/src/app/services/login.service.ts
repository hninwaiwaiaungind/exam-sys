import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { StorageService } from '../services/storage.service';

import { environment } from 'src/environments/environment';
import { LoggedUser } from '../interfaces/model';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private apiEndPoint = environment.apiEndPoint;

  constructor(
    private http: HttpClient,
    private router: Router,
    private storageSvc: StorageService
  ) { }

  isLoggedIn() {
    const user: LoggedUser = this.storageSvc.getData('user');
    if (user.userRole) {
      return true;
    } else {
      return false;
    }
  }

  login(email: any, password: any): Promise<any> {
    const apiUrl = this.apiEndPoint + '/auth/local';
    const body = {
      identifier: email,
      password: password
    };
    return new Promise((resolve, reject) => {
      this.http.post(apiUrl, body).subscribe({
        next: (data: any) => {
          const userInfo = {
            userId: data.user.id,
            apiKey: data.jwt
          };
          this.storageSvc.setData('user', userInfo);
          resolve(data);
        },
        error: error => {
          reject(error);
        }
      });
    });
  }

  getMe(): Promise<any> {
    const loginUrl = this.apiEndPoint + '/users/me';
    return new Promise((resolve, reject) => {
      this.http.get(loginUrl).subscribe({
        next: (data: any) => {
          resolve(data);
        },
        error: error => {
          reject(error);
        }
      });
    });
  }

  logout() {
    this.storageSvc.remove('user');
    this.router.navigate(['/login']);
  }
}
