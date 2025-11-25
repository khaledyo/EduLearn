import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';

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

    const credentials = { email: this.email.trim(), password: this.password };

    try {
      const response = await firstValueFrom(this.loginService.loginUser(credentials));

      this.isLoading = false;
      const message = response?.message || 'Connexion réussie !';
      this.showMessage(message, 'success');

      const userData = {
        ...response.user,
        token: response.token
      };

      this.loginService.setUserData(userData);
      this.redirectUser(userData.role);

    } catch (err: any) {
      this.isLoading = false;

      let errorMessage = 'Échec de la connexion.';
     
      if (err.status === 0) {
        errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion.';
        this.authError = errorMessage;
      } else if (err.status === 401 || err.status === 404) {
        errorMessage = err.error?.message || 'Email ou mot de passe incorrect';
        this.authError = errorMessage;
      } else if (err.status === 403) {
        errorMessage = err.error?.message || 'Accès refusé. Votre compte est en attente d\'approbation.';
        this.authError = errorMessage; 
      } else if (err.status === 422) {
        // Validation errors from Laravel
        if (err.error?.errors) {
          const errors = err.error.errors;
          const errorMessages: string[] = [];
          Object.keys(errors).forEach(key => {
            if (Array.isArray(errors[key]) && errors[key].length > 0) {
              errorMessages.push(...errors[key]);
            }
          });
          if (errorMessages.length > 0) {
            errorMessage = errorMessages.join('. ');
          }
        } else {
          errorMessage = err.error?.message || 'Données invalides.';
        }
        this.authError = errorMessage;
      } else if (err.status === 500) {
        errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
        this.authError = errorMessage;
      } else if (err.error?.message) {
        errorMessage = err.error.message;
        this.authError = errorMessage;
      } else if (err.message) {
        errorMessage = err.message;
        this.authError = errorMessage;
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

  private redirectUser(role: string | null | undefined) {
    switch (role) {
      case 'student':
        this.router.navigate(['/mes-cours-etudiant']);
        break;
      case 'teacher':
        this.router.navigate(['/mes-cours-enseignant']);
        break;
      case 'admin':
        this.router.navigate(['/']);
        break;
      default:
        this.router.navigate(['/']);
    }
  }
}