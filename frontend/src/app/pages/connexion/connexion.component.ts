import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-connexion',
  templateUrl: './connexion.component.html',
  styleUrls: ['./connexion.component.css']
})
export class ConnexionComponent {
  email = '';
  password = '';
  isLoading = false;
  showFieldErrors = false;
  authError = ''; 

  constructor(
    private loginService: LoginService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  async onLogin() {
   
    this.authError = '';

   
    if (!this.isFormValid()) {
      this.showFieldErrors = true;
      return;
    }

    this.isLoading = true;

    const credentials = { email: this.email.trim(), motDePasse: this.password };

    try {
      const response = await this.loginService.loginUser(credentials).toPromise();

      this.isLoading = false;
      this.showMessage(response.message || 'Connexion réussie !', 'success');

      const userData = { ...response.user, token: response.token };
      this.loginService.setUserData(userData);

     
      const role = response.user.role;
      if (role === 'etudiant') {
        this.router.navigate(['/mes-cours-etudiant']);
      } else if (role === 'enseignant') {
        this.router.navigate(['/mes-cours-enseignant']);
      } else {
        this.router.navigate(['/']);
      }

    } catch (err: any) {
      this.isLoading = false;

      let errorMessage = 'Échec de la connexion.';
     
      if (err.status === 401 || err.status === 404) {
        errorMessage = 'Email ou mot de passe incorrect';
        this.authError = errorMessage; 
      } else if (err.status === 500) {
        errorMessage = 'Erreur serveur.';
      } else if (err.error?.message) {
        errorMessage = err.error.message;
      }

      this.showMessage(errorMessage, 'error');
    }
  }

  // ✅ Validation centralisée
  isFormValid(): boolean {
    return (
      !!this.email &&
      this.isValidEmail(this.email) &&
      !!this.password &&
      this.password.length >= 8
    );
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  onFieldChange() {
   
    if (this.showFieldErrors && this.isFormValid()) {
      this.showFieldErrors = false;
    }
    
   
    if (this.authError) {
      this.authError = '';
    }
  }

  showMessage(message: string, type: 'success' | 'error') {
    this.snackBar.open(message, 'Fermer', {
      duration: 3500,
      panelClass: type === 'success' ? ['success-snackbar'] : ['error-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
}