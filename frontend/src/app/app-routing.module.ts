import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccueilComponent } from './pages/accueil/accueil.component';
import { ConnexionComponent } from './pages/connexion/connexion.component';
import { InscriptionComponent } from './pages/inscription/inscription.component';
import { MesCoursEtudiantComponent } from './pages/mes-cours-etudiant/mes-cours-etudiant.component';
import { MesCoursEnseignantComponent } from './pages/mes-cours-enseignant/mes-cours-enseignant.component';
import { AuthGuard } from './guards/auth.guard';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { CoursDetailComponent } from './pages/cours-detail/cours-detail.component';
import { ConsultationCoursEnsComponent } from './pages/consultation-cours-ens/consultation-cours-ens.component';
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
import { AboutComponent } from '@pages/about/about.component';

const routes: Routes = [
  { path: '', component: AccueilComponent},
  { path: 'about', component: AboutComponent },
  { path: 'connexion', component: ConnexionComponent },
  { path: 'inscription', component: InscriptionComponent },
  { path: 'mes-cours-etudiant', component: MesCoursEtudiantComponent, canActivate: [AuthGuard] },
  { path: 'enseignant/mes-cours', component: ConsultationCoursEnsComponent, canActivate: [AuthGuard] },
  { path: 'mes-cours-enseignant', component: MesCoursEnseignantComponent, canActivate: [AuthGuard] },
  { path: 'enseignant/mes-classes', component: MesClassesEnseignantComponent, canActivate: [AuthGuard] },
  { path: 'enseignant/classe/:id', component: ClasseDetailComponent, canActivate: [AuthGuard] },
  { path: 'etudiant/classe/:id/cours', component: ClasseCoursEtudiantComponent, canActivate: [AuthGuard] },
  { path: 'mot-de-passe-oublie', component: ForgotPasswordComponent },
  { path: 'cours/:id', component: CoursDetailComponent, canActivate: [AuthGuard] },
  { path: 'catalogue-cours', component: CatalogueCoursComponent, canActivate: [AuthGuard] },
  { path: 'cours-detail-etud/:id', component: CoursDetailEtudiantComponent, canActivate: [AuthGuard] },
  { path: 'take-quiz/:id', component: TakeQuizComponent, canActivate: [AuthGuard] },
  { path: 'take-exam/:id', component: TakeExamComponent, canActivate: [AuthGuard] },
  { path: 'exam-grading-list/:examId', component: ExamGradingListComponent, canActivate: [AuthGuard] },
  { path: 'exam-answer-review/:resultId', component: ExamAnswerReviewComponent, canActivate: [AuthGuard] },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [AuthGuard] },
  { path: 'admin/teachers', component: ManageTeachersComponent, canActivate: [AuthGuard] },
  { path: 'admin/students', component: ManageStudentsComponent, canActivate: [AuthGuard] },
  { path: 'admin/classes', component: ManageClassesComponent, canActivate: [AuthGuard] },
  { path: 'admin/class-requests', component: CourseApprovalsComponent, canActivate: [AuthGuard] },
  { path: 'admin/users/:id', component: AdminUserDetailComponent, canActivate: [AuthGuard] },
  { path: 'contact', component: ContactComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }