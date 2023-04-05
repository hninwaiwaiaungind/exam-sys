import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

//pages
import { LoginComponent } from './pages/login/login.component';
import { ExamListComponent } from './pages/exam-list/exam-list.component';
import { CsvRegistrationComponent } from './pages/csv-registration/csv-registration.component';
import { UserListComponent } from './pages/user-list/user-list.component';
import { AnswerListPageComponent } from './pages/answer-list-page/answer-list-page.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { UserFormComponent } from './pages/user-form/user-form.component';
import { ExamResultComponent } from './pages/exam-result/exam-result.component';
import { ExamRegisterComponent } from './pages/exam-register/exam-register.component';
import { ExamComponent } from './pages/exam/exam.component';
import { ExamInfoComponent } from './pages/exam-info/exam-info.component';

// route guard
import { AuthGuard } from './guard/auth/auth.guard';
import { AdminGuard } from './guard/admin/admin.guard';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'exam/:id',
    component: ExamRegisterComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'exam/:id/questions',
    component: ExamComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'exam/:id/answer',
    component: AnswerListPageComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'exam/:id/result',
    component: ExamResultComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'exam',
    component: ExamRegisterComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'exam-list',
    component: ExamListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'my-test',
    component: ExamInfoComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'exam',
    component: ExamRegisterComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'csv-registration',
    component: CsvRegistrationComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'user-list',
    component: UserListComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'user/:id',
    component: UserFormComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'user',
    component: UserFormComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'profile/me',
    component: ProfileComponent,
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
