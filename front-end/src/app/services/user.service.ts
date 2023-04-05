import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import * as qs from 'qs';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(
    private http: HttpClient
  ) { }

  forUserRole(): Observable<any> {
    return this.http.get(`${environment.apiEndPoint}/users`);
  }

  checkEmail(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(`${environment.apiEndPoint}/users?populate=%2A`).subscribe(
        {
          next: data => resolve(data),
          error: e => reject(e)
        }
      );
    });
  }

  getUserList(): Observable<any> {
    const query = qs.stringify({
      populate: '*',
      sort: {
        id: 'desc'
      },
      filters: {
        blocked: false
      },
      encodeValuesOnly: true,
    }, { addQueryPrefix: true, skipNulls: true });

    const uri = environment.apiEndPoint + '/users';
    return this.http.get(`${uri}${query}`);
  }

  getRoles(): Observable<any> {
    return this.http.get(`${environment.apiEndPoint}/users-permissions/roles`);
  }

  getUserDetail(id: number): Observable<any> {
    return this.http.get(`${environment.apiEndPoint}/users/${id}?populate=*`);
  }

  addUser(body: any): Observable<any> {
    return this.http.post(`${environment.apiEndPoint}/users?populate=%2A`, body);
  }

  editUser(id: number, body: any): Observable<any> {
    return this.http.put(`${environment.apiEndPoint}/users/${id}`, body);
  }

  uploadImage(imgFile: File) {
    const fileData = new FormData();
    fileData.append('files', imgFile);
    return this.http.post(`${environment.apiEndPoint}/upload`, fileData);
  }

  userAdd(body: any): Observable<any> {
    return this.http.post(
      `${environment.apiEndPoint}/users?populate=%2A`,
      body
    );
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${environment.apiEndPoint}/users/${id}`);
  }

  createCSVUserAdd(users: any) {
    return this.http.post(
      `${environment.apiEndPoint}/users-permissions/csv-useradd`,
      users
    );
  }

  getExam(): Observable<any> {
    return this.http.get(`${environment.apiEndPoint}/exams/?populate=*`);
  }
}
