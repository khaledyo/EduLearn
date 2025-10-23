import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccueilComponent } from './pages/accueil/accueil.component';
import { ConnexionComponent } from './pages/connexion/connexion.component';
import { InscriptionComponent } from './pages/inscription/inscription.component';
import { MesCoursEtudiantComponent } from './pages/mes-cours-etudiant/mes-cours-etudiant.component';
import { MesCoursEnseignantComponent } from './pages/mes-cours-enseignant/mes-cours-enseignant.component';
import { AuthGuard } from './guards/auth.guard';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';


const routes: Routes = [
  { path: '', component: AccueilComponent },
  { path: 'connexion', component: ConnexionComponent },
  { path: 'inscription', component: InscriptionComponent },
  { path: 'mes-cours-etudiant', component: MesCoursEtudiantComponent , canActivate: [AuthGuard]},
  { path: 'mes-cours-enseignant', component: MesCoursEnseignantComponent, canActivate: [AuthGuard] },
  { path: 'mot-de-passe-oublie', component: ForgotPasswordComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
