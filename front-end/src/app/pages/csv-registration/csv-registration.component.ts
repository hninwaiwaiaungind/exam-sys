import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import * as Papa from 'papaparse';
import { Router } from '@angular/router';

//interfaces
import { CSV, Role, User } from 'src/app/interfaces/model';

//services
import { UserService } from 'src/app/services/user.service';
import { MessagesService } from 'src/app/services/messages.service';

import { MESSAGES } from 'src/app/constants/messages';
import { COMMON_CONSTANTS } from 'src/app/constants/constants';

import { CsvDialogComponent } from 'src/app/components/csv-dialog/csv-dialog.component';

@Component({
  selector: 'app-csv-registration',
  templateUrl: './csv-registration.component.html',
  styleUrls: ['./csv-registration.component.scss']
})
export class CsvRegistrationComponent implements OnInit {
  @ViewChild('csvReader') csvReader: any;
  @ViewChild('paginator') paginator!: MatPaginator;
  @ViewChild(MatSort) set MatSort(sort: MatSort) {
    this.dataSource.sort = sort;
  }
  @ViewChild(MatPaginator) set matPaginator(paginator: MatPaginator) {
    this.dataSource.paginator = paginator;
  }
  fileName: string = '';
  csvFile!: any;
  CsvResult: CSV[] = [];
  roles!: Role[];
  dataSource = new MatTableDataSource<CSV>([]);
  users: User[] = [];
  showTable: boolean = false;
  editIndex!: number;
  displayedColumns: string[] = ['id', 'username', 'email', 'role', 'action'];
  pageSizeOptions: number[] = [6, 12, 18, 24, 30];

  constructor(
    private router: Router,
    private userSvc: UserService,
    private dialog: MatDialog,
    private messageSvc: MessagesService
  ) { }

  ngOnInit() {
    this.getUserList();
    this.getRolesList();
  }

  getRolesList(): void {
    this.userSvc.getRoles().subscribe({
      next: (data: { roles: Role[] }) => {
        this.roles = data.roles.filter(role => role.id > 2);
      },
      error: (error) => {
        this.messageSvc.commonMessage('error', error);
      }
    });
  }

  getUserList(): void {
    this.userSvc.getUserList().subscribe({
      next: (users) => {
        this.users = users;
      },
      error: (error) => {
        this.messageSvc.commonMessage('error', error);
      },
    });
  }

  isValidCSVFile(file: File): boolean {
    return file.name.endsWith('csv');
  }

  uploadFile(event: any): void {
    this.csvFile = event.target.files[0];
    if (this.csvFile && this.csvFile.length !== 0) {
      if (!this.isValidCSVFile(this.csvFile)) {
        this.csvFile = '';
        this.messageSvc.commonMessage('error', MESSAGES.CSV_FILE);
      } else {
        if (this.csvFile.size) {
          this.fileName = this.csvFile?.name ? this.csvFile.name : '';
          Papa.parse(this.csvFile, {
            skipEmptyLines: true,
            header: true,
            complete: (results: any) => {
              results.data.map((user: any, index: number) => user.id = index)
              this.getDataSource(results.data);
              this.showTable = true;
              this.CsvResult = results.data;
            },
            error: (error: any) => {
              this.messageSvc.commonMessage('error', error.message);
            }
          })
        } else {
          this.messageSvc.commonMessage('error', MESSAGES.EMPTY_CSV_FILE);
          this.fileReset();
        }
      }
    } else {
      this.fileReset();
    }
  }

  fileReset(): void {
    this.csvReader.nativeElement.value = '';
    this.csvFile = '';
    this.fileName = '';
    this.showTable = false;
    this.CsvResult = [];
  }

  submitData(): void {
    if (this.checkCsvDataValid(this.CsvResult)) {
      this.userSvc.createCSVUserAdd(this.CsvResult).subscribe({
        next: () => {
          this.messageSvc.commonMessage('success', MESSAGES.UPLOADED_MESSAGE);
          this.router.navigate(['/user-list']);
        },
        error: (err) => {
          if (err.error.message === MESSAGES.ALREADY_IN_USE) {
            this.CsvResult = (err.error.errorUserrname && err.error.errorUsername.length > 0) ? err.error.errorUsername : err.error.errorEmail;
            this.messageSvc.commonMessage('error', err.error.message);
            this.getDataSource(this.CsvResult);
          } else {
            this.messageSvc.commonMessage('error', err)
          }
        }
      });
    }
  }

  checkCsvDataValid(records: CSV[]) {
    const duplicateUsers = records.filter((user: any, index: number) => {
      return index !== records.findIndex(secondUser => (secondUser.username === user.username));
    }).map((user) => user.username);
    if (duplicateUsers.length === 0) {
      const duplicateEmails = records.filter((user: any, index: number) => {
        return index !== records.findIndex(secondUser => (secondUser.email === user.email));
      }).map((user) => user.email);
      if (duplicateEmails.length === 0) {
        const isValidEmail = records.filter((user: any) => {
          return !COMMON_CONSTANTS.EMAIL_PATTERN.test(user.email);
        });
        if (isValidEmail.length === 0) {
          const inValidRole: any = [];
          records.forEach((record) => {
            let checkIndex = this.roles.findIndex(role => role.id === +record.role);
            if (checkIndex === -1) {
              inValidRole.push(record.username);
            }
          });
          if (inValidRole.length === 0) {
            return true;
          } else {
            const inValiduser = Array.from(new Set(inValidRole));
            this.messageSvc.commonMessage('error', MESSAGES.INVALID_ROLES_MESSAGE + '\n' + inValiduser);
            return false;
          }
        } else {
          this.messageSvc.commonMessage('error', MESSAGES.INVALID_EMAIL_MESSAGE);
          return false;
        }
      } else {
        const uniqueEmailList = Array.from(new Set(duplicateEmails));
        this.messageSvc.commonMessage('error', MESSAGES.DUPLICATE_EMAILS + uniqueEmailList);
        return false;
      }
    } else {
      const uniqueUserList = Array.from(new Set(duplicateUsers));
      this.messageSvc.commonMessage('error', MESSAGES.DUPLICATE_USERS + uniqueUserList);
      return false;
    }
  }

  toUpdate(user: CSV): void {
    this.editIndex = this.CsvResult.indexOf(user);
    let dialogRef = this.dialog.open(CsvDialogComponent, {
      width: '350px',
      data: { user: user, roles: this.roles },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.action === 'update') {
        result.data.id = this.editIndex;
        this.CsvResult[this.editIndex] = result.data;
        this.getDataSource(this.CsvResult);
      }
    });
  }

  deleteUser(user: any): void {
    let index = this.CsvResult.indexOf(user);
    this.CsvResult.splice(index, 1);
    this.getDataSource(this.CsvResult);
    if (this.CsvResult && this.CsvResult.length === 0) {
      this.fileReset();
    }
  }

  getDataSource(dataSource: CSV[]): void {
    this.dataSource = new MatTableDataSource(dataSource);
    this.dataSource.paginator = this.paginator;
  }
}
