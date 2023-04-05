import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Exam } from '../interfaces/exam';
import { CSV } from '../interfaces/question';

import * as qs from 'qs';

@Injectable({
  providedIn: 'root'
})
export class ExamService {

  constructor(
    private http: HttpClient
  ) { }

  createExam(payload: Exam) {
    return this.http.post(`${environment.apiEndPoint}/exams`, { data: payload });
  }

  updateExam(payload: any, examId: number) {
    return this.http.put(`${environment.apiEndPoint}/exams/${examId}`, payload);
  }

  uploadQuestionCsv(payload: CSV[]) {
    return this.http.post(`${environment.apiEndPoint}/questions/csv-upload`, payload);
  }

  deleteQuestions(payload: any) {
    return this.http.post(`${environment.apiEndPoint}/questions/deleteMany`, payload);
  }

  getExamDetails(id: number): Observable<any> {
    return this.http.get(`${environment.apiEndPoint}/exams/${id}?populate=*`);
  }

  getQuestions(): Observable<any> {
    return this.http.get(`${environment.apiEndPoint}/questions?populate=*`);
  }

  getExamListWithPagination(page: number, limit: number): Observable<any> {
    const query = qs.stringify(
      {
        pagination: {
          page,
          pageSize: limit
        }
      }
    );
    return this.http.get(`${environment.apiEndPoint}/exams-list?${query}`);
  }

  deleteExam(id: number): Observable<any> {
    return this.http.delete(`${environment.apiEndPoint}/exams/${id}`);
  }

  searchExams(query: string): Observable<any> {
    return this.http.get(`${environment.apiEndPoint}/exams?${query}&populate=%2A`);
  }

  getExam(id: number): Observable<any> {
    return this.http.get(`${environment.apiEndPoint}/exam-result/${id}`);
  }

  getExamData(): Observable<any> {
    return this.http.get(`${environment.apiEndPoint}/exams?populate=*`);
  }

  getMarkWithExam(): Observable<any> {
    return this.http.get(`${environment.apiEndPoint}/marks?populate[user]=*&populate[records][populate]=exam`);
  }

  formatDuration(timeSpend: number): string {
    if (timeSpend >= 60) {
      const hours = Math.floor(timeSpend / 60);
      const minutes = Math.floor(timeSpend % 60);
      const hourSuffix = hours === 1 ? ' hour' : ' hours';
      const minuteSuffix = minutes === 1 ? ' minute' : ' minutes';
      return `${hours}${hourSuffix} ${minutes}${minuteSuffix}`;
    } else {
      const minuteSuffix = timeSpend === 1 ? ' minute' : ' minutes';
      if (timeSpend < 1) {
        const second = Math.round(timeSpend * 60);
        return `${second} seconds`;
      }
      timeSpend = Math.round(timeSpend);
      return `${timeSpend}${minuteSuffix}`;
    }
  }
}
