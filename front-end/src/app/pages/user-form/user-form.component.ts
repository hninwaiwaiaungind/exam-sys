import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { environment } from 'src/environments/environment';

//services
import { UserService } from 'src/app/services/user.service';
import { MessagesService } from 'src/app/services/messages.service';
import { StorageService } from 'src/app/services/storage.service';

//interfaces
import { User } from 'src/app/interfaces/model';

//constants
import { COMMON_CONSTANTS } from 'src/app/constants/constants';
import { MESSAGES } from 'src/app/constants/messages';

//validators
import { MustMatch } from 'src/app/validators/must-match.validator';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit {
  @Input('userProfileId') userProfileId !: string | null;

  userForm: FormGroup | any;
  users: User[] = [];
  user!: User;
  roles: any;
  userRole: string;
  paramId!: number;
  loggedInUserId !: string;
  pageTitle!: string;
  imgUrl !: string | ArrayBuffer | null;
  backUpImg = COMMON_CONSTANTS.BACKUP_IMG;
  profileUrl!: string | undefined;
  profile!: File | null;
  editEnable: boolean = true;
  isEditPage!: boolean;
  public passwordRequired: boolean = true;

  constructor(
    private userSvc: UserService,
    private storageSvc: StorageService,
    public messageSvc: MessagesService,
    public route: Router,
    public activateRoute: ActivatedRoute,
    private fb: FormBuilder) {

    const { userId, userRole } = this.storageSvc.getData('user');
    this.loggedInUserId = userId;
    this.userRole = userRole;

    this.route.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (this.route.url.includes('/user/')) {
          this.pageTitle = 'Edit User';
          this.passwordRequired = false;
        } else if (this.route.url === '/user-create') {
          this.pageTitle = 'Create New User';
          this.passwordRequired = true;
        } else {
          this.pageTitle = 'My Profile';
          this.passwordRequired = false;
        }
      }
    });
  }

  ngOnInit() {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.pattern(COMMON_CONSTANTS.EMAIL_PATTERN)]],
      password: [''],
      confirmPassword: [''],
      role: ['', Validators.required],
    }, {
      validator: MustMatch('password', 'confirmPassword')
    });
    this.userForm.controls['password'].setValidators(this.passwordRequired ? [Validators.required, Validators.maxLength(20), Validators.pattern(COMMON_CONSTANTS.PASSWORD_PATTERN)] : [Validators.maxLength(20), Validators.pattern(COMMON_CONSTANTS.PASSWORD_PATTERN)]);
    this.userForm.controls['confirmPassword'].setValidators(this.passwordRequired ? [Validators.required, Validators.maxLength(20), MustMatch] : null);
    this.paramId = this.userProfileId ? this.userProfileId : this.activateRoute.snapshot.params['id'];
    this.userProfileId = this.userProfileId ?? this.loggedInUserId;
    this.isEditPage = !!this.paramId;

    if (this.paramId) {
      this.getUserDetail(this.paramId);
    }
    this.getRoles();
    this.decidePermission();
  }
  getUserDetail(id: number) {
    this.userSvc.getUserDetail(id).subscribe({
      next: (user: User) => {
        this.profileUrl = user.profileUrl;
        this.userForm.patchValue({
          username: user.username,
          email: user.email,
          password: user.password ? user.password : '',
          role: user.role.id
        });
        this.user = user;
        this.editEnable = this.userRole == 'admin';
      },
      error: () => {
        this.messageSvc.commonMessage('error', MESSAGES.UNREGISTER_USER);
      },
    })
  }

  async updateUser() {
    let username = this.userForm.get('username')?.value;
    let email = this.userForm.get('email')?.value;

    if (!username || !email) {
      this.messageSvc.commonMessage('error', 'Username and Email are required.');
      return;
    }

    let userData;
    if (this.profile) {
      let userProfile: any = await this.imgUpload();
      userData = {
        username: username,
        email: email,
        role: this.userForm.get('role')?.value,
        profile: userProfile.imageId,
        profileUrl: userProfile.profileUrl
      }
    } else {
      userData = {
        username: username,
        email: email,
        role: this.userForm.get('role')?.value,
      }
    }

    const password = this.userForm.get('password')?.value;
    const confirmPassword = this.userForm.get('confirmPassword')?.value;

    if (password && confirmPassword && password === confirmPassword) {
      userData = {
        password: password
      }
    } else if (password && confirmPassword && password !== confirmPassword) {
      this.messageSvc.commonMessage('error', MESSAGES.PASSWORD_MSG);
      return;
    }

    this.userSvc.editUser(this.paramId, userData).subscribe({
      next: () => {
        this.messageSvc.commonMessage('success', MESSAGES.UPDATED_MESSAGE)
        if (this.userRole === 'admin') {
          this.route.navigateByUrl('/user-list');
        } else {
          this.route.navigateByUrl('/my-test');
        }
      },
      error: (err) => {
        this.messageSvc.commonMessage('error', err.error.error.status === 400 ? err.error.error.message : err);
      }
    });
  }

  getRoles() {
    this.userSvc.getRoles().subscribe({
      next: (roles: any) => {
        this.roles = roles.roles.filter((role: any) => role.id > 2);
      },
      error: (err) => {
        this.messageSvc.commonMessage('error', err);
      }
    });
  }

  registerUser(user: User): void {
    this.userSvc.addUser(user).subscribe({
      next: (data: User) => {
        this.users.unshift(data);
        this.messageSvc.commonMessage('success', MESSAGES.CREATED_MESSAGE);
        this.route.navigateByUrl('/user-list');
      },
      error: err => {
        if (err.error.error.message === 'This attribute must be unique') {
          this.messageSvc.commonMessage('error', MESSAGES.USERNAME_IS_ALREADY_IN_USE);
        } else {
          this.messageSvc.commonMessage('error', err.error.error.status === 403 ? err : err.error.error.message);
        }
      }
    });
  }

  async addUserInfo(): Promise<void> {
    let user: User;
    user = {
      username: this.userForm.value.username,
      email: this.userForm.value.email,
      password: this.userForm.value.password,
      role: this.userForm.value.role,
    };
    if (this.profile) {
      let userProfile: any = await this.imgUpload();
      this.profileUrl = userProfile.profileUrl;
      user.profile = userProfile.imageId;
      user.profileUrl = userProfile.profileUrl;
    }
    if (this.paramId) {
      this.updateUser();
    } else {
      this.registerUser(user);
    }
  }

  handleImage(event: any) {
    this.profile = event.target?.files[0];
    const fileType = this.profile?.type.split('/')[1];
    if (COMMON_CONSTANTS.FILE_EXTENTION.indexOf(fileType!) < 0) {
      this.messageSvc.commonMessage('error', MESSAGES.IMAGE_MESSAGE);
      this.profile = null;
    } else if (this.profile) {
      const reader = new FileReader();
      reader.readAsDataURL(this.profile);
      reader.onload = () => {
        this.imgUrl = reader.result;
      }
      reader.onerror = () => {
        this.messageSvc.commonMessage('error', MESSAGES.FILE_ERROR);
      }
    }
  }

  imgUpload() {
    return new Promise((resolve) => {
      if (this.profile) {
        this.userSvc.uploadImage(this.profile).subscribe({
          next: (response: any) => {
            this.profileUrl = `${environment.apiUpload}${response[0].url}`;
            resolve({
              profileUrl: this.profileUrl,
              imageId: response[0].id
            })
          },
          error: (err) => {
            this.messageSvc.commonMessage('error', err.error.error.status === 403 ? err : MESSAGES.FILE_ERROR);
          }
        });
      }
    })
  }

  clear(): void {
    this.userForm.reset();
    if (this.userRole === 'admin') {
      this.route.navigate(['/user-list']);
    }
    else {
      this.route.navigate(['/exam-list']);
    }
  }

  decidePermission(): void {
    if (Number(this.paramId) === Number(this.userProfileId) || !this.isEditPage) {
      if (this.userRole === 'client') {
        this.userForm.get('role')?.disable();
      }
      this.userForm.get('email')?.enable();
      this.userForm.get('password')?.enable();
      this.userForm.get('confirmPassword')?.enable();
    } else {
      if (this.paramId === +this.loggedInUserId) {
        this.userForm.get('email')?.enable();
        this.userForm.get('password')?.enable();
        this.userForm.get('confirmPassword')?.enable();
      } else {
        this.userForm.get('email')?.disable();
        this.userForm.get('password')?.disable();
        this.userForm.get('confirmPassword')?.disable();
      }
    }
  }

  public myError = (controlName: string, errorName: string): boolean => {
    return this.userForm.controls[controlName].hasError(errorName);
  };
}
