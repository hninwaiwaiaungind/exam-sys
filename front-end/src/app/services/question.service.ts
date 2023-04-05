import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import * as qs from 'qs';
@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  constructor(private http: HttpClient) { }

  getExam(id: any): Observable<any> {
    const query = qs.stringify({
      populate: {
        questions: {
          fields: ['allowMultiAns', 'answerChoice', 'question', 'questionType', 'updatedAt', 'id']
        }
      },
      sort: {
        id: 'desc'
      },
      encodeValuesOnly: true,
    }, { addQueryPrefix: true, skipNulls: true });

    const uri = environment.apiEndPoint + `/exams/${id}`;
    return this.http.get(`${uri}${query}`);
  }

  getDateTime(id: any): Observable<any> {
    const query = qs.stringify({
      select: ['startDte', 'endDte'],
      encodeValuesOnly: true,
    }, { addQueryPrefix: true, skipNulls: true });
    const url = environment.apiEndPoint + `/exams/${id}`;
    return this.http.get(`${url}${query}`)
  }

  submitAnswers(payload: any): Observable<any> {
    return this.http.post(`${environment.apiEndPoint}/users-permissions/answer-submit`, payload);
  }

  getMarkDetails(id: number, examId: number): Observable<any> {
    const payload = {
      id: id,
      examId: examId
    }
    return this.http.post(`${environment.apiEndPoint}/users-permissions/pdfdownload`, payload);
  }

  pdfDownloadResult(userId: number, examId: number): Observable<any> {
    const payload = {
      id: userId,
      examId: examId
    }
    return this.http.post(`${environment.apiEndPoint}/users-permissions/pdfdownload`, payload);
  }

  sendEmail(payload: any): Observable<any> {
    return this.http.post(`${environment.apiEndPoint}/users-permissions/email`, payload);
  }
}

