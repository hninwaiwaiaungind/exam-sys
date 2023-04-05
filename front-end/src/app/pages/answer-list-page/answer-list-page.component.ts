import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';

//interfaces
import { Question } from 'src/app/interfaces/model';

//messages
import { MESSAGES } from 'src/app/constants/messages';

//services
import { AnswerListService } from 'src/app/services/answer-list.service';
import { MessagesService } from 'src/app/services/messages.service';

@Component({
  selector: 'app-answer-list-page',
  templateUrl: './answer-list-page.component.html',
  styleUrls: ['./answer-list-page.component.scss']
})
export class AnswerListPageComponent implements OnInit {
  @ViewChild('paginator') paginator!: MatPaginator;
  public dataSource: any = new MatTableDataSource<Question>();
  questions!: Question[];
  exams!: any;
  paramId!: number;
  answerType: any;
  questionDataSource!: Observable<any>;
  showPaginator: boolean = false;
  noDataBeforeExam: boolean = false;
  pageSizeOptions: number[] = [6, 12, 18, 24, 30];

  constructor(
    private ansSvc: AnswerListService,
    private activateRoute: ActivatedRoute,
    private router: Router,
    private msgSvc: MessagesService,
    private ref: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.paramId = this.activateRoute.snapshot.params['id'];
    this.getExamData();
  }

  findCorrectAns(correctAns: any, index: number): boolean {
    correctAns = correctAns.map((ans: any) => Number(ans));
    return correctAns.includes(index);
  }

  getDataSource(dataSource: Question[]): void {
    this.dataSource = new MatTableDataSource(dataSource);
    this.ref.detectChanges();
    this.dataSource.paginator = this.paginator;
    this.questionDataSource = this.dataSource.connect();
    if (dataSource.length > 0) {
      this.showPaginator = true;
    } else {
      this.showPaginator = false;
    }
  }

  getExamData() {
    this.ansSvc.getExamInfo(this.paramId).subscribe({
      next: (exam => {
        this.exams = exam;
        this.noDataBeforeExam = this.exams.length === 0;
        if (exam.questions) {
          this.questions = exam.questions;
          this.questions.map((question: any) => {
            question.answerChoice = question.answerChoice.split('\n');
            if (question.allowMultiAns) {
              question.correctAns = question.correctAns.split(',');
            }
          });
          this.getDataSource(this.questions);
        } else {
          this.msgSvc.commonMessage('error', MESSAGES.ANSWER_NOT_AVAILABLE).then(() => {
            this.router.navigateByUrl('/exam-list');
          })
        }
      }),
      error: (err) => {
        this.noDataBeforeExam = true;
        this.msgSvc.commonMessage('error', err).then(() => {
          this.router.navigateByUrl('/exam-list');
        }
        )
      }
    })
  }
}

