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
import { CoursDetailComponent } from './pages/cours-detail/cours-detail.component';
import { CatalogueCoursComponent } from './pages/catalogue-cours/catalogue-cours.component';
import { CoursDetailEtudiantComponent } from './pages/cours-detail-etudiant/cours-detail-etudiant.component';

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
    CoursDetailComponent,
    CatalogueCoursComponent,
    CoursDetailEtudiantComponent
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
