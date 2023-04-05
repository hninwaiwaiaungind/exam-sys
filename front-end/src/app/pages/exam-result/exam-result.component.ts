import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {ActivatedRoute, Router} from '@angular/router';

//services
import {ExamService} from 'src/app/services/exam.service';
import {MessagesService} from 'src/app/services/messages.service';

//pipe
import {UsernameFilterPipe} from 'src/app/pipes/username-filter.pipe';
import {ExamResultFilterPipe} from 'src/app/pipes/exam-result-filter.pipe';

@Component({
  selector: 'app-exam-result',
  templateUrl: './exam-result.component.html',
  styleUrls: ['./exam-result.component.scss']
})
export class ExamResultComponent implements OnInit {
  @ViewChild('paginator') paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatSort) set matSort(sort: MatSort) {
    if (this.dataSource) {
      this.dataSource.sort = sort;
    }
  }

  public examWithMarkResult: any = [];
  public examResultFilter: any;
  public searchName = '';
  examId!: number;
  selectedResult: string = 'all';
  examname!: string;
  examStartDate!: Date;
  examEndDate!: Date;
  examDuration: number = 0;
  noOfQuestions: number = 0;
  dataSource: any;
  displayedColumns: string[] = ['id', 'examname', 'username', 'mark', 'ansStartDte', 'ansEndDte', 'duration'];
  examFilter = [
    { key: 'all', value: 'ALL' },
    { key: 'pass', value: 'PASS' },
    { key: 'fail', value: 'FAIL' }
  ];
  pageOptions = [6, 12, 18, 24, 30];
  noDataDiv = false;

  constructor(
    public examSvc: ExamService,
    public messageSvc: MessagesService,
    public activateRoute: ActivatedRoute,
    private ref: ChangeDetectorRef,
    private router: Router) { }

  ngOnInit(): void {
    this.examId = this.activateRoute.snapshot.params['id'];
    this.getDataByExamId(this.examId);
  }

  nameAndResultFilter() {
    const result = new UsernameFilterPipe().transform(
      this.examResultFilter ? this.examResultFilter : this.examWithMarkResult, this.searchName);
    this.dataSource = new MatTableDataSource(result);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  resultFilter() {
    this.examResultFilter = new ExamResultFilterPipe()
      .transform(this.examWithMarkResult, this.selectedResult);
    this.dataSource = new MatTableDataSource(this.examResultFilter);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  reset() {
    this.searchName = '';
    this.selectedResult = 'all';
    this.dataSource = new MatTableDataSource(this.examWithMarkResult);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  getDataByExamId(id: number) {
    this.examSvc.getExam(id).subscribe({
      next: async (exams: any) => {
        this.noDataDiv = exams.length === 0;
        let resultData = exams.map((exam: any) => {
          this.examname = exam.mark[0].exam.name;
          this.examStartDate = exam.mark[0].exam.startDte;
          this.examEndDate = exam.mark[0].exam.endDte;
          this.examDuration = exam.mark[0].exam.duration;
          this.noOfQuestions = exam.mark[0].exam.questions.length;

          let mark = exam.mark[0].mark;
          let ansStartDte = new Date(exam.mark[0].ansStartDte);
          let ansEndDte = new Date(exam.mark[0].ansEndDte);
          let durationMs = ansEndDte.getTime() - ansStartDte.getTime();
          let duration = durationMs / (1000 * 60);

          return {
            examname: this.examname,
            username: exam.user.username,
            passMark: exam.mark[0].exam.passMark,
            mark: mark,
            ansStartDte: ansStartDte,
            ansEndDte: ansEndDte,
            duration: duration
          };
        });

        this.examWithMarkResult.push(...resultData);
        this.dataSource = new MatTableDataSource(this.examWithMarkResult);
        this.ref.detectChanges();
        this.dataSource.paginator = this.paginator;
        if (this.dataSource && this.dataSource.sort) {
          this.dataSource.sort.sort({ id: 'mark', start: 'desc', disableClear: false });
        }
      },
      error: (error) => {
        this.messageSvc.commonMessage('error', error).then(() => {
          this.router.navigate(['/exam-list']);
        });
      }
    })
  }

  formatDuration(timeSpend: number): string {
    return this.examSvc.formatDuration(timeSpend);
  }

  textChange(event: any) {
    if (!event.target.value) {
      this.resultFilter();
    }
  }
}
