import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TooltipPosition } from '@angular/material/tooltip';
import { ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { orderBy } from 'lodash';
import * as qs from 'qs';

//services
import { ExamService } from 'src/app/services/exam.service';
import { MessagesService } from 'src/app/services/messages.service';
import { StorageService } from 'src/app/services/storage.service';

//interfaces
import { Exam } from 'src/app/interfaces/model';

@Component({
  selector: 'app-exam-list',
  templateUrl: './exam-list.component.html',
  styleUrls: ['./exam-list.component.scss']
})
export class ExamListComponent implements OnInit {
  @ViewChild("paginator") paginator!: MatPaginator;
  positionOptions: TooltipPosition = 'above';
  examData: Exam[] = [];
  todayDate!: string;
  startDate!: string;
  endDate!: string;
  pageOptions = [6, 12, 18, 24, 30];
  examDataSource!: Observable<any>;
  searchTitle!: string;
  searchStartDate!: Date | '';
  searchEndDate!: Date | '';
  isDataExist = true;
  isAdmin = false;

  public dataSource = new MatTableDataSource<Exam>();
  pageLength!: number;
  isFiltered = false;
  constructor(
    private examSvc: ExamService,
    public messageSvc: MessagesService,
    private storageSvc: StorageService,
    private ref: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.getExamListWithPagination();
    this.todayDate = this.toConvertDateTime(new Date()).toISOString();
    this.isAdmin = this.storageSvc.isAdmin;
  }

  getExamListWithPagination(pageIndex = 0, pageSize = this.pageOptions[0]) {
    this.isFiltered = false;
    this.examSvc.getExamListWithPagination(pageIndex, pageSize).subscribe({
      next: (examList) => {
        this.pageLength = examList.meta.pagination.total;
        this.isDataExist = examList.data.length !== 0;
        this.examData = examList.data;
        this.getDataSoucre(this.examData);
      },
      error: (error) => {
        this.messageSvc.commonMessage('error', error);
      }
    });
  }

  getExamWithFilter() {
    this.isFiltered = true;
    const filter = [];
    if (this.searchTitle) {
      filter.push({
        $or: [
          {
            name: {
              $containsi: this.searchTitle
            },
          },
        ],
      });
    }
    if (this.searchStartDate && this.searchEndDate) {
      const startDate = this.toConvertDateTime(this.searchStartDate);
      startDate.setDate(startDate.getDate() - 1);

      const endDate = this.toConvertDateTime(this.searchEndDate);
      endDate.setDate(endDate.getDate() + 1);

      filter.push({
        startDte: {
          $gte: startDate.toISOString()
        },
        endDte: {
          $lt: endDate.toISOString(),
        }
      })
    }
    if (this.searchStartDate) {
      const startDate = this.toConvertDateTime(this.searchStartDate);
      startDate.setDate(startDate.getDate());

      filter.push({
        startDte: {
          $gte: startDate.toISOString()
        }
      })
    }
    if (this.searchEndDate) {
      const endDate = this.toConvertDateTime(this.searchEndDate);
      endDate.setDate(endDate.getDate() + 1);

      filter.push({
        endDte: {
          $lt: endDate.toISOString()
        }
      })
    }
    const query = qs.stringify(
      {
        filters: {
          $and: filter,
        },
      }
    );
    this.examSvc.searchExams(query).subscribe({
      next: (filteredData) => {
        this.isDataExist = filteredData.data.length !== 0;
        this.pageLength = filteredData.meta.pagination.total;
        this.examData = filteredData.data;
        this.examData = orderBy(this.examData, [(exam: any) => {
          if (this.toConvertDateTime(exam.attributes.startDte)
            >= this.toConvertDateTime(new Date())) {
            return 1;
          } else if (this.toConvertDateTime(exam.attributes.endDte)
            <= this.toConvertDateTime(new Date())) {
            return -1;
          }
          return 0;
        }], ['desc']);
        this.getDataSoucre(this.examData);
        this.ref.detectChanges();
        this.dataSource.paginator = this.paginator;
      },
      error: (error) => {
        if (error) {
          this.messageSvc.commonMessage('error', error);
        }
      }
    })
  }

  clear() {
    this.searchTitle = ''
    this.searchStartDate = '';
    this.searchEndDate = '';
    this.getExamListWithPagination();
  }

  getDataSoucre(dataSource: Exam[]) {
    this.dataSource = new MatTableDataSource(dataSource);
    this.examDataSource = this.dataSource.connect();
  }

  isExamExpired(startDateTime: Date, endDateTime: Date): boolean {
    this.startDate = this.toConvertDateTime(startDateTime).toISOString();
    this.endDate = this.toConvertDateTime(endDateTime).toISOString();
    return this.todayDate <= this.startDate || this.todayDate >= this.endDate;
  }

  isExamUpComing(endDateTime: Date): boolean {
    this.endDate = this.toConvertDateTime(endDateTime).toISOString();
    return this.todayDate <= this.endDate;
  }

  toConvertDateTime(date: Date) {
    const offset = new Date(date).getTimezoneOffset();
    const dateMilli = new Date(new Date(date).getTime() - (offset * 60 * 1000));
    return new Date(dateMilli);
  }

  disableButton() {
    return !(this.searchTitle || this.searchStartDate || this.searchEndDate);
  }

  textChange(event: any) {
    if (event.target.value === '') {
      this.getExamListWithPagination();
    }
  }

  pageChange(event: any) {
    if (this.isFiltered) {
      this.getExamWithFilter();
    } else {
      this.getExamListWithPagination(event.pageIndex, event.pageSize);
    }
  }

  deleteExam(id: number) {
    this.messageSvc.comfirmMessage('question', 'Are you sure you want to delete this exam?').then((result) => {
      if (result.isConfirmed) {
        this.examSvc.deleteExam(id).subscribe({
          next: () => {
            this.messageSvc.commonMessage('success', 'Exam deleted successfully');
            this.getExamListWithPagination();
          },
          error: (error) => {
            this.messageSvc.commonMessage('error', error);
          }
        });
      }
    });
  }
}
