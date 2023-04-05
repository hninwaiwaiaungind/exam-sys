import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import * as Papa from 'papaparse';
import { Observable } from 'rxjs';
// services
import { ExamService } from '../../services/exam.service';
import { MessagesService } from '../../services/messages.service';
// interfaces
import { Exam } from '../../interfaces/exam';
import { CSV, Question } from '../../interfaces/question';
// pages and components
import { QuestionsEditComponent } from '../../components/questions-edit/questions-edit.component';
// constants
import { MESSAGES } from '../../constants/messages';

@Component({
  selector: 'app-exam-register',
  templateUrl: './exam-register.component.html',
  styleUrls: ['./exam-register.component.scss'],
})
export class ExamRegisterComponent implements OnInit {
  @ViewChild('questionFile') fileReader: any;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  examForm!: FormGroup;
  questionFile!: File;
  questionTitle!: string;
  isFileChoose = false;
  questionData!: CSV[];
  questionsId!: number[];
  createdQuestion!: Question[];
  questionFileName!: string;
  minDate!: Date;
  startDate!: Date;
  tomorrow!: Date;
  message: any;
  minEndDate!: Date;
  durations!: number[];
  examId!: number;
  isEditPage = false;
  examDetails!: Exam;
  questionsList!: Question[];
  dataSources$ = new Observable<any[]>();
  questions!: Question[];
  dataSource = new MatTableDataSource<any>();
  showPaginator = false;
  pageSizeOptions = [6, 12, 18, 24, 30];

  constructor(
    private fb: FormBuilder,
    private examSvc: ExamService,
    private messageSvc: MessagesService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private router: Router
  ) {
    this.durations = [5, 10, 15, 20, 30, 45, 60];
    this.examForm = this.fb.group({
      name: ['', Validators.required],
      questions: [''],
      duration: [5],
      startDte: ['', Validators.required],
      endDte: ['', Validators.required],
      passMark: ['', Validators.required],
    });
    this.minDate = new Date();
    this.minEndDate = new Date();
    this.message = MESSAGES;
  }

  ngOnInit(): void {
    this.examId = this.route.snapshot.params['id'];
    if (this.examId) {
      this.getExamDetails(this.examId);
      this.isEditPage = true;
      this.getQuestions();
    }
  }

  handleFileUpload(event: any) {
    this.isFileChoose = true;
    this.questionFile = event.target.files[0];
    if (!this.questionFile) {
      this.resetFile();
    } else {
      this.readCsvFile();
    }
  }

  readCsvFile() {
    this.questionFileName = this.questionFile.name;
    const isCsv = this.isValidCsvFile(this.questionFile);
    if (!isCsv) {
      this.resetFile();
      this.messageSvc.commonMessage('error', MESSAGES.CHOOSE_CSV_FILE);
    } else {
      Papa.parse(this.questionFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results: any) => {
          this.questionData = results.data;
          this.questionData.map((question) => {
            if (question.questionType === 'radio') {
              return (question.allowMultiAns = false);
            }
            if (question.questionType === 'checkbox') {
              return (question.allowMultiAns = true);
            }
            return question;
          });
          this.questionTitle = this.questionData.map((question) => {
            return question.question;
          }).join(', ');

          if (this.questionData.length === 0) {
            this.messageSvc.commonMessage('error', MESSAGES.EMPTY_CSV_FILE);
            this.resetFile();
          }
          this.getDataSources(this.questionData);
          this.showPaginator = this.questionData.length > 0;
        },
      });
    }
  }

  resetFile() {
    this.fileReader.nativeElement.value = '';
    this.questionFileName = '';
    this.questionFile = {} as File;
    this.isFileChoose = false;
    this.questionTitle = '';
    this.showPaginator = false;
    this.questionData = [];
    this.dataSource = new MatTableDataSource(this.questionData);
    this.dataSources$ = this.dataSource.connect();
  }

  setTomorrowDate() {
    this.startDate = this.examForm.get('startDte')?.value;
    if (this.startDate) {
      this.tomorrow = new Date(this.startDate);
      this.tomorrow.setDate(this.tomorrow.getDate() + 1);
      this.examForm.patchValue({
        endDte: this.tomorrow
      });
      this.minEndDate = this.tomorrow;
    } else {
      this.examForm.patchValue({
        endDte: ''
      });
    }
  }

  async createExam() {
    let questionId: number[] = [];
    if (!this.isEditPage) {
      if (this.questionData) {
        questionId = await this.uploadQuestion();
      }
      const payload = {
        ...this.examForm.value,
        questions: questionId,
      };
      this.examSvc.createExam(payload).subscribe({
        next: () => {
          this.messageSvc.commonMessage(
            'success',
            MESSAGES.EXAM_CREATE_SUCCESS
          );
          this.router.navigate(['/exam-list']);
        },
        error: (error) => {
          this.messageSvc.commonMessage('error', error);
          this.examSvc.deleteQuestions(questionId).subscribe();
        },
      });

    } else {
      const { questions, ...payloadData } = this.examForm.value;
      const payload = {
        data: {
          ...payloadData,
          questions: this.questionsId
        }
      };
      this.examSvc.updateExam(payload, this.examId).subscribe({
        next: () => {
          this.messageSvc.commonMessage('success', MESSAGES.EXAM_UPDATE_SUCCESS);
          this.router.navigate(['/exam-list']);
        },
        error: (error) => {
          this.messageSvc.commonMessage('error', error);
        }
      });
    }
  }

  uploadQuestion() {
    return new Promise<number[]>((resolve) => {
      let questionId;
      this.examSvc.uploadQuestionCsv(this.questionData).subscribe({
        next: (response: any) => {
          this.createdQuestion = response.createdQuestions;
          questionId = this.createdQuestion.map((question) => {
            return question.id;
          });
          resolve(questionId);
        },
        error: (error) => {
          this.messageSvc.commonMessage('error', error);
        }
      });
    });
  }

  getExamDetails(id: number) {
    this.examSvc.getExamDetails(id).subscribe({
      next: response => {
        this.examDetails = response.data;
        this.questionsList = this.examDetails.attributes.questions.data;
        const { name, duration, startDte, endDte, passMark, questions } = this.examDetails.attributes;
        this.examForm.patchValue({
          name,
          duration,
          startDte,
          endDte,
          passMark
        });
        this.questionsId = questions.data.map((question) => {
          return question.id;
        });
        this.showPaginator = this.questionsList.length > 0;
        this.getDataSources(this.questionsList);

        this.startDate = new Date(this.examForm.get('startDte')?.value);
        this.minDate = new Date(this.startDate.getFullYear(), this.startDate.getMonth(), 1, 0, 0, 0, 0);
        this.minEndDate = new Date(this.minDate.getTime());
        this.minEndDate.setDate(this.startDate.getDate() + 1);
      },
      error: (error) => {
        this.messageSvc.commonMessage('error', error);
      }
    }
    );
  }

  getQuestions() {
    this.examSvc.getQuestions().subscribe({
      next: (response) => {
        this.questions = response.data;
      },
      error: (error) => {
        this.messageSvc.commonMessage('error', error);
      }
    });
  }

  openDialog() {
    const editData = { pageType: 'edit', selectedQuestions: this.questionsList, questionsList: this.questions };
    const createData = { pageType: 'register', questions: this.questionData };
    const dialogRef = this.dialog.open(QuestionsEditComponent, {
      data: this.isEditPage ? editData : createData
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (this.isEditPage) {
        const selectQuestions = result?.data ?? this.questionsList;
        this.questionsId = selectQuestions.map((question: Question) => {
          return question.id;
        });
        this.questionsList = selectQuestions;
        this.showPaginator = selectQuestions.length;
        this.getDataSources(selectQuestions);
      } else {
        this.questionData = result.data;
        if (!this.questionData.length) {
          this.resetFile();
        }
        this.questionTitle = this.questionData.map((question) => {
          return question.question;
        }).join(', ');
      }
    })
  }

  deleteQuestion(question: any) {
    if (this.isEditPage) {
      const index = this.questionsList.indexOf(question);
      this.questionsList.splice(index, 1);
      this.questionsId = this.questionsList.map((question: Question) => {
        return question.id;
      });
      this.getDataSources(this.questionsList);
      this.showPaginator = this.questionsList.length !== 0;
    } else {
      const index = this.questionData.indexOf(question);
      this.questionData.splice(index, 1);
      this.getDataSources(this.questionData);
      if (this.questionData.length === 0) {
        this.resetFile();
      }
    }
  }

  isValidCsvFile(file: File) {
    const fileType = file.type.split('/').pop();
    return fileType === 'csv';
  }

  findError(name: string, errorName: string) {
    return this.examForm.get(name)?.hasError(errorName);
  }

  getDataSources(data: any) {
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.paginator = this.paginator;
    this.dataSources$ = this.dataSource.connect();
  }
}
