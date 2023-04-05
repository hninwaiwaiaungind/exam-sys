import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';

//interfaces
import { Role, User } from 'src/app/interfaces/model';

//services
import { UserService } from 'src/app/services/user.service';
import { MessagesService } from 'src/app/services/messages.service';

//constants
import { MESSAGES } from 'src/app/constants/messages';

//pipes
import { UserFilterPipe } from 'src/app/pipes/user-filter.pipe';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;

  public users: User[] = [];
  public exams: any = [];
  roles!: Role[];
  public searchName = '';
  selectedRole: string = 'All'
  displayedColumns: string[] = ['id', 'username', 'email', 'role', 'action'];
  dataSource = new MatTableDataSource<User>([]);
  pageSizeOptions: number[] = [6, 12, 18, 24, 30];

  constructor(
    private userSvc: UserService,
    public messageSvc: MessagesService,
    public router: Router) { }

  ngOnInit(): void {
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
        this.showData();
      },
      error: (error) => {
        this.messageSvc.commonMessage('error', error);
      },
    });
  }

  searchByUsernameAndRole() {
    const result = new UserFilterPipe().transform(this.users, this.searchName, this.selectedRole, 'both');
    this.dataSource = new MatTableDataSource<User>(result);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  canclevalue() {
    this.searchName = '';
    this.selectedRole = 'All';
    this.dataSource = new MatTableDataSource(this.users);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  showData(): void {
    this.dataSource = new MatTableDataSource(this.users);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  toUpdate(id: string): void {
    this.router.navigateByUrl(`/user/${id}`);
  }

  async deleteUser(id: number) {
    const result = await this.messageSvc.comfirmMessage('question', MESSAGES.DELETE_CONFIRM_MESSAGE);
    if (result.isConfirmed) {
      this.userSvc.deleteUser(id).subscribe(user => {
        this.users = this.users.filter((u: any) => u.id !== user.id);
        this.getUserList();
      });
      this.messageSvc.commonMessage('success', MESSAGES.DELETE_MESSAGE);
    }
  }

  textChange(event: any) {
    if (event.target.value === '') {
      this.getUserList();
    }
  }
}
