// module import
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { MatSidenavContainer } from '@angular/material/sidenav';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularMaterialModule } from './angular-material.module';

// page import
import { AppComponent } from './app.component';
import { AnswerListPageComponent } from './pages/answer-list-page/answer-list-page.component';
import { CsvRegistrationComponent } from './pages/csv-registration/csv-registration.component';
import { LoginComponent } from './pages/login/login.component';
import { UserListComponent } from './pages/user-list/user-list.component';
import { CsvDialogComponent } from './components/csv-dialog/csv-dialog.component';
import { ExamListComponent } from './pages/exam-list/exam-list.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { UserFormComponent } from './pages/user-form/user-form.component';
import { ExamComponent } from './pages/exam/exam.component';
import { ExamResultComponent } from './pages/exam-result/exam-result.component';
import { ExamRegisterComponent } from './pages/exam-register/exam-register.component';
import { ExamInfoComponent } from './pages/exam-info/exam-info.component';

// dialog and component import
import { IconComponent } from './components/icon/icon.component';
import { LoaderComponent } from './components/loader/loader.component';
import { QuestionsEditComponent } from './components/questions-edit/questions-edit.component';

// service import
import { AuthInterceptorService } from './services/auth-interceptor.service';

// pipes, interface and const import
import { NameSearchByIdPipe } from './pipes/name-search-by-id.pipe';
import { UsernameFilterPipe } from './pipes/username-filter.pipe';

@NgModule({
  declarations: [
    AppComponent,
    AnswerListPageComponent,
    LoginComponent,
    ExamComponent,
    CsvRegistrationComponent,
    UserListComponent,
    CsvDialogComponent,
    NameSearchByIdPipe,
    LoaderComponent,
    ExamListComponent,
    IconComponent,
    UserFormComponent,
    ProfileComponent,
    ExamResultComponent,
    ExamRegisterComponent,
    UsernameFilterPipe,
    QuestionsEditComponent,
    ExamInfoComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularMaterialModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [
    MatSidenavContainer,
    UsernameFilterPipe,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi: true,
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
