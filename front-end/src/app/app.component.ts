import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

//services
import { LoginService } from './services/login.service';
import { StorageService } from './services/storage.service';
import { UserService } from './services/user.service';

// interface and const
import { User } from './interfaces/model';
import { COMMON_CONSTANTS } from './constants/constants';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  examActive = false;
  showExamMenu = false;
  showMenuBar = true;
  profileUrl!: string;
  backUpImg = COMMON_CONSTANTS.BACKUP_IMG;
  loggedInUser!: any;
  userDetails!: User;
  isAdmin = false;
  activeExamRegister = false;

  constructor(
    private router: Router,
    private loginService: LoginService,
    private storageSvc: StorageService,
    private userService: UserService
  ) {
    this.router.events.subscribe(event => {
      this.isAdmin = this.storageSvc.isAdmin;
      if (event instanceof NavigationEnd) {
        this.getUser();
        const currentRoute = this.router.url;
        const userInfo = this.storageSvc.getData('user');
        if (userInfo) {
          this.storageSvc.isAdmin = userInfo.userRole === 'admin';
        }
        if (currentRoute === '/' || currentRoute === '/login') {
          this.showMenuBar = false;
        } else {
          this.showMenuBar = true;
        }
      }
    });
  }

  ngDoCheck() {
    const currentRoute = this.router.url;
    this.examActive = ['/exam', '/exam-list'].includes(currentRoute);
    if (this.examActive) {
      currentRoute === '/exam' ? this.activeExamRegister = true : this.activeExamRegister = false;
    }
  }

  getUser() {
    this.loggedInUser = this.storageSvc.getData('user');
    if (this.loggedInUser.userId) {
      this.userService.getUserDetail(this.loggedInUser.userId).subscribe(res => {
        this.userDetails = res;
        this.profileUrl = this.userDetails.profileUrl!;
      });
    }
  }

  logOut() {
    this.loginService.logout();
  }
}
