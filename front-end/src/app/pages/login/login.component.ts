import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

//services
import { LoginService } from 'src/app/services/login.service';
import { StorageService } from '../../services/storage.service';
import { MessagesService } from 'src/app/services/messages.service';

import { LoggedUser } from '../../interfaces/model';
import { COMMON_CONSTANTS } from '../../constants/constants';
import { MESSAGES } from 'src/app/constants/messages';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm !: FormGroup;
  showPassword: boolean = false;

  constructor(
    private router: Router,
    private loginService: LoginService,
    public messageSvc: MessagesService,
    private storageSvc: StorageService
  ) {
    this.loginForm = new FormGroup({
      email: new FormControl(null, [
        Validators.required, Validators.pattern(COMMON_CONSTANTS.EMAIL_PATTERN),
        Validators.email
      ]),
      password: new FormControl(null, [
        Validators.required
      ])
    });
  }

  ngOnInit(): void {
    this.storageSvc.remove('user');
  }

  get myForm() {
    return this.loginForm.controls;
  }

  login(): void {
    this.loginService.login(this.loginForm.value.email, this.loginForm.value.password)
      .then(() => {
        this.getRole();
      }).catch(() => {
        this.messageSvc.commonMessage('error', MESSAGES.INVALID_USER_MSG);
      });
  }

  getRole(): void {
    this.loginService.getMe().then(res => {
      const userInfo: LoggedUser = this.storageSvc.getData('user');
      userInfo.userRole = res.role.type;
      this.storageSvc.setData('user', userInfo);
      this.router.navigate(['/my-test']);
    }).catch(() => {
      Swal.fire({
        icon: 'error',
        text: MESSAGES.USER_ROLE_MSG
      });
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
