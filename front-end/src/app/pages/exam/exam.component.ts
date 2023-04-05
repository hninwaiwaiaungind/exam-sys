import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as moment from 'moment';

//services
import { QuestionService } from 'src/app/services/question.service';
import { UserService } from 'src/app/services/user.service';
import { MessagesService } from 'src/app/services/messages.service';

// const and interface
import { MESSAGES } from 'src/app/constants/messages';
import { User } from '../../interfaces/user';

@Component({
  selector: 'app-exam',
  templateUrl: './exam.component.html',
  styleUrls: ['./exam.component.scss']
})
export class ExamComponent implements OnInit {
  selectedIndex: number = 0;
  maxNumberOfTabs: any;
  id: any = [];
  selectedAnswer: any = [];
  selectedCheckBox: any = [];
  limitTime: any;
  exam: any = [];
  user: any;
  questionList: any = [];
  examId!: number;
  answerControl = new FormControl('');
  hours: any;
  minutes: any;
  seconds: any;
  errorMessage = '';
  passMark: any;
  mark: any;
  timeInterval: any;
  showResults: boolean = false;
  results: any;
  ansStartDate: any;
  ansEndDate: any;
  timeDuration: any;
  examName: any;
  diffTime: any;
  textbox: any;
  validateExam: boolean = true;
  userDetails!: User;

  constructor(
    private questionSvc: QuestionService,
    private userSvc: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private messageSvc: MessagesService
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.examId = +params.get('id')!;
      this.user = JSON.parse(localStorage.getItem('user')!);
      this.userSvc.getUserDetail(this.user.userId).subscribe((res: any) => {
        const finishExam = res.ansRecord?.data.find((data: any) => data.examId == this.examId);
        this.userDetails = res;
        if (finishExam) {
          this.getMarkDetails();
          this.messageSvc.commonMessage('info', MESSAGES.EXAM_ALREADY_ANSWERED_MSG);
          this.showResults = true;
          this.questionSvc.getExam(this.examId).subscribe((response: any) => {
            this.exam = response.data;
            this.passMark = this.exam.attributes.passMark;
          });
        } else {
          this.questionSvc.getDateTime(this.examId).subscribe({
            next: (res: any) => {
              this.exam = res.data;
              if (this.exam) {
                const startDateString = this.exam?.attributes.startDte;
                const endDateString = this.exam?.attributes.endDte;
                const startDate = new Date(startDateString).getTime();
                const endDate = new Date(endDateString).getTime();
                const todayDate = new Date().getTime();
                this.limitTime = this.exam.duration;
                this.examName = this.exam.attributes.name;
                if (startDate < todayDate && endDate > todayDate) {
                  this.ansStartDate = new Date();
                  this.getExam();
                } else {
                  if (startDate > todayDate) {
                    this.validateExam = false;
                    this.errorMessage = MESSAGES.EXAM_BEFORE_MSG
                  }
                  if (endDate <= todayDate) {
                    this.validateExam = false;
                    this.errorMessage = MESSAGES.EXAM_AFTER_MSG
                  }
                  this.messageSvc.commonMessage('info', this.errorMessage).then(() => {
                    this.router.navigate(['/exam-list']);
                  });
                }
              }
            },
            error: () => {
              this.errorMessage = MESSAGES.INVALID_EXAM_ID;
              this.messageSvc.commonMessage('error', this.errorMessage).then(() => {
                this.router.navigate(['/exam-list']);
              });
            }
          })
        }
      })
    })
  }

  getExam() {
    this.questionSvc.getExam(this.examId).subscribe((response: any) => {
      this.exam = response.data;
      this.questionList = this.exam.attributes.questions.data;
      this.limitTime = this.exam.attributes.duration;
      this.maxNumberOfTabs = this.questionList.length - 1;
      this.passMark = this.exam.attributes.passMark;
      this.counter(this.limitTime);
    }, error => {
      this.messageSvc.commonMessage('error', error);
    });
  }

  getMarkDetails() {
    this.questionSvc.getMarkDetails(this.user.userId, this.examId!).subscribe((response: any) => {
      let result = response;
      this.mark = result.totalMarks;
      this.ansStartDate = result.startDate;
      this.ansEndDate = result.endDate;
      this.examName = result.name;
      this.diffTime = result.duration;
    }, error => {
      this.messageSvc.commonMessage('error', error);
    });
  }

  counter(timer: number) {
    let seconds = timer * 60;
    this.timeInterval = setInterval(() => {
      seconds--;
      if (seconds === 0) {
        this.messageSvc.commonMessage('info', MESSAGES.EXAM_TIMER_MSG).then(() => {
          this.router.navigate([`/exam/${this.examId}/questions`]);
        });
        this.onSubmit();
        clearInterval(this.timeInterval);
      }
      timer = Math.floor(seconds / 60);
      let remainingSeconds = seconds % 60;
      let remainingMinutes = Math.floor(seconds / 60) % 60;
      let remainingHours = Math.floor(seconds / 3600) % 24;
      let timeString = "";
      if (remainingHours > 0) {
        timeString += remainingHours + " hr: ";
      }
      timeString += (remainingMinutes < 10 ? "0" : "") + remainingMinutes + " min : ";
      timeString += (remainingSeconds < 10 ? "0" : "") + remainingSeconds + " s";
      this.limitTime = timeString;
      this.hours = remainingHours;
      this.minutes = remainingMinutes;
      this.seconds = remainingSeconds;
    }, 1000);
  };

  next() {
    this.selectedCheckBox = [];
    if (this.selectedIndex < this.maxNumberOfTabs) {
      this.selectedIndex++;
    }
  }

  previous() {
    this.selectedCheckBox = [];
    this.selectedIndex--;
    if (this.selectedIndex <= 0) {
      this.selectedIndex = 0;
    }
  }

  getAnswer(answerChoice: any) {
    let answerArray = answerChoice.split('\n');
    return answerArray;
  }

  showContent(id: number) {
    this.selectedCheckBox = [];
    this.selectedIndex = id;
  }

  changeCheck(answer: number, type: string) {
    if (type == 'checkbox') {
      if (typeof (this.selectedAnswer[this.selectedIndex]) == 'object') {
        this.selectedCheckBox = this.selectedAnswer[this.selectedIndex];
      }
      if (this.selectedCheckBox.includes(answer)) {
        const index = this.selectedCheckBox.indexOf(answer);
        this.selectedCheckBox.splice(index, 1)
      } else {
        this.selectedCheckBox.push(answer)
      }
      this.selectedAnswer[this.selectedIndex] = this.selectedCheckBox;
    } else {
      this.selectedAnswer[this.selectedIndex] = answer;
    }
  }

  onSubmit() {
    const questionArray: any = [];
    this.questionList.map((question: any, i: any) => {
      this.selectedAnswer.map((answer: any, index: number) => {
        if (i == index) {
          if (Array.isArray(this.selectedAnswer[i])) {
            answer = this.selectedAnswer[i].map((item: number) => {
              return item + 1;
            })
            answer = answer.sort();
          } else {
            answer = typeof (this.selectedAnswer[i]) == 'number' ? this.selectedAnswer[i] + 1 : this.selectedAnswer[i]
          }
          questionArray.push(
            {
              questionId: question.id,
              answer: answer
            }
          )
        }
      });
    });

    const payload: any = {
      id: this.user.userId,
      ansStartDte: this.ansStartDate,
      data: {
        examId: this.examId,
        question: questionArray
      }
    };
    this.questionSvc.submitAnswers(payload).subscribe((res: any) => {
      this.showResults = true;
      this.mark = res.newRecordDetails.mark;
      this.ansStartDate = new Date(res.newRecordDetails.ansStartDte);
      this.ansEndDate = new Date(res.newRecordDetails.ansEndDte);
      let timeDiff = this.ansEndDate.getTime() - this.ansStartDate.getTime();
      const seconds = Math.floor(timeDiff / 1000) % 60;
      const minutes = Math.floor(timeDiff / (1000 * 60)) % 60;
      const hours = Math.floor(timeDiff / (1000 * 60 * 60)) % 60;
      const hourSuffix = hours === 1 ? 'hr' : 'hrs';
      const minuteSuffix = minutes === 1 ? 'min' : 'mins';
      if (hours) {
        this.diffTime = `${hours} ${hourSuffix}  ${minutes} ${minuteSuffix} ${seconds} secs`;
      } else if (minutes) {
        this.diffTime = `${minutes} ${minuteSuffix} ${seconds} secs`;
      } else {
        this.diffTime = `${seconds} secs`;
      }
      payload.mark = this.mark;
    }, error => {
      this.messageSvc.commonMessage('error', error);
    });
    this.limitTime = 0;
  }

  async submit() {
    const result: any = await this.messageSvc.submitAnswered('error', MESSAGES.EXAM_SUBMIT_TITLE);
    if (result.isConfirmed) {
      clearInterval(this.timeInterval);
      this.timeDuration = this.exam.attributes.duration - this.timeInterval;
      this.onSubmit();
    }
  }

  checkColor(val: any): any {
    if (val === null ||
      val !== undefined &&
      val?.length !== 0 &&
      val !== null) {
      return {
        "color": '#fff',
        "backgroundColor": '#3596B5'
      }
    }
  }

  checkMark(mark: any, passMark: any) {
    let retColor = {
      'color': 'red',
    };
    if (passMark <= mark) {
      retColor = {
        'color': '#3596B5',
      };
    }
    return retColor;
  }

  checkSpinner(mark: any, passMark: any) {
    if (passMark > mark) {
      return 'FAIL'
    }
    return;
  }

  calculatePercent(mark: number, totalMark: number) {
    let percent = (mark / totalMark) * 100;
    if (mark === 0) {
      percent = 100;
    }
    return percent
  }

  sendEmail() {
    const payload = {
      id: this.userDetails.id,
      examId: this.examId
    };
    this.questionSvc.sendEmail(payload).subscribe({
      next: (data: any) => {
        this.messageSvc.commonMessage('success', data.message);
      },
      error: (err: any) => {
        this.messageSvc.commonMessage('error', err);
      }
    })
  }

  pdfDownload() {
    this.questionSvc.pdfDownloadResult(this.user.userId, this.examId).subscribe({
      next: (data: any) => {
        this.results = data;
        const startDate = moment(this.results.startDate).format("MMM DD, YYYY, hh:mm A");
        const endDate = moment(this.results.endDate).format("MMM DD, YYYY, hh:mm A");
        const testData = [
          ['Your Exam Results'],
          ['Exam title', this.results.name],
          ['Number of questions', this.results.totalQuestions],
          ['Username', this.results.username],
          ['Email', this.results.email],
          ['Answer start date', startDate],
          ['Answer end date', endDate],
          ['Duration', this.results.duration],
          ['Score', this.results.totalMarks],
          ['Result', this.results.grade]
        ];
        const doc = new jsPDF();
        autoTable(doc, {
          body: [
            [{
              colSpan: 2,
              content: testData[0],
              styles: {
                halign: 'center',
                fillColor: [53, 150, 181],
                textColor: 255,
                fontSize: 13,
              }
            }],
            [testData[1][0], testData[1][1]],
            [testData[2][0], testData[2][1]],
            [testData[3][0], testData[3][1]],
            [testData[4][0], testData[4][1]],
            [testData[5][0], testData[5][1]],
            [testData[6][0], testData[6][1]],
            [testData[7][0], testData[7][1]],
            [testData[8][0], testData[8][1]],
            [testData[9][0], testData[9][1]]
          ],
          startY: 30,
          tableWidth: 'wrap',
          theme: 'plain',
          styles: {
            cellPadding: 5,
            fontSize: 10,
            halign: 'left'
          },
          columnStyles: {
            0: {
              cellWidth: 50,
              fontStyle: 'bold',
              fillColor: [244, 244, 244],
              textColor: 0,
            },
            1: {
              cellWidth: 65,
              fillColor: [244, 244, 244],
              textColor: 0,
            }
          },
          margin: { left: 50 },
        });
        doc.save('result.pdf');
      },
      error: err => {
        this.messageSvc.commonMessage('error', err);
      }
    });
  }
}
