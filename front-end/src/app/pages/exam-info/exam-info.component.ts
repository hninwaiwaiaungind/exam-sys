import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {Observable} from 'rxjs';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';

//services
import {ExamService} from 'src/app/services/exam.service';
import {StorageService} from 'src/app/services/storage.service';
import {MessagesService} from 'src/app/services/messages.service';

//interfaces
import {Exam} from 'src/app/interfaces/model';

@Component({
  selector: 'app-exam-info',
  templateUrl: './exam-info.component.html',
  styleUrls: ['./exam-info.component.scss']
})
export class ExamInfoComponent implements OnInit {
  @ViewChild('paginator') paginator!: MatPaginator;
  loggedInUserId !: number;
  public examInfoResult: any[] = [];
  dataSource = new MatTableDataSource<Exam>([]);
  examDataSource!: Observable<any>;
  pageSizeOptions: number[] = [6, 12, 18, 20];
  isShowData = false;

  constructor(
    private storageSvc: StorageService,
    private examSvc: ExamService,
    private messagesSvc: MessagesService,
    private ref: ChangeDetectorRef
  ) {
    const { userId } = this.storageSvc.getData('user');
    this.loggedInUserId = userId
  }

  ngOnInit() {
    this.getExamList();
  }

  getExamList() {
    this.examSvc.getMarkWithExam().subscribe({
      next: (exam) => {
        const result = exam.data
        let markData = result.map((mark: any) => {
          return mark;
        }).filter((mark: any) => {
          return mark?.attributes.user.data.id === this.loggedInUserId;
        });

        this.examInfoResult = markData[0]?.attributes.records.map((record: any) => {
          let startDate = new Date(record.exam.data.attributes.startDte);
          let endDate = new Date(record.exam.data.attributes.endDte);
          let startTime = new Date(record.ansStartDte);
          let endTime = new Date(record.ansEndDte);
          let timeSpendMs = endTime.getTime() - startTime.getTime();
          let timeSpend = timeSpendMs / (1000 * 60);

          return {
            examId: record.exam.data.id,
            examname: record.exam.data.attributes.name,
            duration: record.exam.data.attributes.duration,
            passMark: record.exam.data.attributes.passMark,
            startDate: startDate,
            endDate: endDate,
            mark: record.mark,
            ansStartDate: startTime,
            ansEndDate: endTime,
            timeSpend: timeSpend
          };
        });
        if (this.examInfoResult.length) {
          this.showData();
        }
      },
      error: (error) => {
        this.messagesSvc.commonMessage('error', error);
      }
    })
  }

  showData(): void {
    this.isShowData = true;
    this.examInfoResult = this.examInfoResult.sort((a, b) => a.examId - b.examId).reverse();
    this.dataSource = new MatTableDataSource(this.examInfoResult);
    this.examDataSource = this.dataSource.connect();
    this.ref.detectChanges();
    this.dataSource.paginator = this.paginator;
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
      timeSpend = Math.round(timeSpend);
      return `${timeSpend}${minuteSuffix}`;
    }
  }
}
