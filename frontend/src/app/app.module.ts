import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { AccueilComponent } from './pages/accueil/accueil.component';
import { ConnexionComponent } from './pages/connexion/connexion.component';
import { InscriptionComponent } from './pages/inscription/inscription.component';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MesCoursEtudiantComponent } from './pages/mes-cours-etudiant/mes-cours-etudiant.component';
import { MesCoursEnseignantComponent } from './pages/mes-cours-enseignant/mes-cours-enseignant.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ConsultationCoursEnsComponent } from './pages/consultation-cours-ens/consultation-cours-ens.component';
import { CoursModalComponent } from './components/cour-modal/cour-modal.component';
import { DeleteConfirmationModalComponent } from './components/delete-confirmation-modal/delete-confirmation-modal.component';
import { ClassModalComponent } from './components/class-modal/class-modal.component';
import { AddSupportModalComponent } from './components/add-support-modal/add-support-modal.component';
import { InviteStudentModalComponent } from './components/invite-student-modal/invite-student-modal.component';
import { CreateQuizModalComponent } from './components/create-quiz-modal/create-quiz-modal.component';
import { CreateExamModalComponent } from './components/create-exam-modal/create-exam-modal.component';
import { QuizDetailModalComponent } from './components/quiz-detail-modal/quiz-detail-modal.component';
import { ExamDetailModalComponent } from './components/exam-detail-modal/exam-detail-modal.component';
import { QuizResultsModalComponent } from './components/quiz-results-modal/quiz-results-modal.component';
import { ExamResultsModalComponent } from './components/exam-results-modal/exam-results-modal.component';
import { CoursDetailComponent } from './pages/cours-detail/cours-detail.component';
import { CatalogueCoursComponent } from './pages/catalogue-cours/catalogue-cours.component';
import { CoursDetailEtudiantComponent } from './pages/cours-detail-etudiant/cours-detail-etudiant.component';
import { MesClassesEnseignantComponent } from './pages/mes-classes-enseignant/mes-classes-enseignant.component';
import { ClasseDetailComponent } from './pages/classe-detail/classe-detail.component';
import { ClasseCoursEtudiantComponent } from './pages/classe-cours-etudiant/classe-cours-etudiant.component';
import { TakeQuizComponent } from './pages/take-quiz/take-quiz.component';
import { TakeExamComponent } from './pages/take-exam/take-exam.component';
import { ExamGradingListComponent } from './pages/exam-grading-list/exam-grading-list.component';
import { ExamAnswerReviewComponent } from './pages/exam-answer-review/exam-answer-review.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { ManageTeachersComponent } from './pages/manage-teachers/manage-teachers.component';
import { ManageStudentsComponent } from './pages/manage-students/manage-students.component';
import { ManageClassesComponent } from './pages/manage-classes/manage-classes.component';
import { CourseApprovalsComponent } from './pages/course-approvals/course-approvals.component';
import { AdminUserDetailComponent } from './pages/admin-user-detail/admin-user-detail.component';
import { ContactComponent } from '@pages/contact/contact.component';
import { AboutComponent } from './pages/about/about.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    AccueilComponent,
    ConnexionComponent,
    InscriptionComponent,
    MesCoursEtudiantComponent,
    MesCoursEnseignantComponent,
    ForgotPasswordComponent, 
    ConsultationCoursEnsComponent,
    CoursModalComponent,
    DeleteConfirmationModalComponent,
    ClassModalComponent,
    AddSupportModalComponent,
    InviteStudentModalComponent,
    CreateQuizModalComponent,
    CreateExamModalComponent,
    QuizDetailModalComponent,
    ExamDetailModalComponent,
    QuizResultsModalComponent,
    ExamResultsModalComponent,
    CoursDetailComponent,
    CatalogueCoursComponent,
    CoursDetailEtudiantComponent,
    MesClassesEnseignantComponent,
    ClasseDetailComponent,
    ClasseCoursEtudiantComponent,
    TakeQuizComponent,
    TakeExamComponent,
    ExamGradingListComponent,
    ExamAnswerReviewComponent,
    AdminDashboardComponent,
    ManageTeachersComponent,
    ManageStudentsComponent,
    ManageClassesComponent,
    CourseApprovalsComponent,
    AdminUserDetailComponent,
    ContactComponent,
    AboutComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    
    MatSnackBarModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
