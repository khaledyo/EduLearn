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

const routes: Routes = [
  { path: '', component: AccueilComponent},
  { path: 'connexion', component: ConnexionComponent },
  { path: 'inscription', component: InscriptionComponent },
  { path: 'mes-cours-etudiant', component: MesCoursEtudiantComponent, canActivate: [AuthGuard] },
  { path: 'enseignant/mes-cours', component: ConsultationCoursEnsComponent, canActivate: [AuthGuard] },
  { path: 'mes-cours-enseignant', component: MesCoursEnseignantComponent, canActivate: [AuthGuard] },
  { path: 'mot-de-passe-oublie', component: ForgotPasswordComponent },
  { path: 'cours/:id', component: CoursDetailComponent, canActivate: [AuthGuard] },
  { path: 'catalogue-cours', component: CatalogueCoursComponent, canActivate: [AuthGuard] },
  { path: 'cours-detail-etud/:id', component: CoursDetailEtudiantComponent, canActivate: [AuthGuard] }, 
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }