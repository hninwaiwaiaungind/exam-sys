import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnswerListService {

  constructor(private http: HttpClient) { }

  getExamInfo(id: any): Observable<any> {
    return this.http.get(`${environment.apiEndPoint}/exam-info/${id}?populate=*`);
  }
}
