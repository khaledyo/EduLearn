import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { API_CONFIG } from '../../core/api-config';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  currentStep = 1;
  email = '';
  verificationCode: string[] = new Array(6).fill('');
  newPassword = '';
  confirmPassword = '';
  isLoading = false;
  errorMessage = '';
  codeError = false;
  
  countdownMinutes = 5;
  countdownSeconds = 0;
  private countdownInterval: any;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  get maskedEmail(): string {
    if (!this.email) return '';
    const [local, domain] = this.email.split('@');
    const maskedLocal = local.substring(0, 2) + '*'.repeat(local.length - 4) + local.substring(local.length - 2);
    return `${maskedLocal}@${domain}`;
  }

  sendVerificationCode() {
    if (!this.email || !this.isValidEmail(this.email)) {
      this.errorMessage = 'Veuillez entrer une adresse email valide.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.http.post(`${API_CONFIG.baseUrl}/forgot-password`, { email: this.email })
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.currentStep = 2;
          this.startCountdown();
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.message || 'Erreur lors de l\'envoi du code.';
        }
      });
  }

  verifyCode() {
    const code = this.verificationCode.join('');
    
    if (code.length !== 6) {
      this.codeError = true;
      this.errorMessage = 'Veuillez entrer le code complet à 6 chiffres.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.codeError = false;

    this.http.post(`${API_CONFIG.baseUrl}/verify-code`, {
      email: this.email,
      code: code
    }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.currentStep = 3;
        this.stopCountdown();
      },
      error: (err) => {
        this.isLoading = false;
        this.codeError = true;
        this.errorMessage = err.error?.message || 'Code incorrect.';
      }
    });
  }

  resetPassword() {
    if (this.newPassword.length < 8) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 8 caractères.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const code = this.verificationCode.join('');

    this.http.post(`${API_CONFIG.baseUrl}/reset-password`, {
      email: this.email,
      code: code,
      newPassword: this.newPassword
    }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.currentStep = 4;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Erreur lors de la réinitialisation.';
      }
    });
  }

  onCodeInput(event: any, index: number) {
    const input = event.target;
    const value = input.value;
    
    // Ne permettre que les chiffres
    if (!/^\d*$/.test(value)) {
      input.value = '';
      this.verificationCode[index] = '';
      return;
    }

    if (value && index < 5) {
      const nextInput = document.getElementsByName('code' + (index + 1))[0] as HTMLInputElement;
      if (nextInput) nextInput.focus();
    }
  }

  onCodeKeyDown(event: KeyboardEvent, index: number) {
    if (event.key === 'Backspace' && !this.verificationCode[index] && index > 0) {
      const prevInput = document.getElementsByName('code' + (index - 1))[0] as HTMLInputElement;
      if (prevInput) prevInput.focus();
    }
  }

  resendCode(event: Event) {
    event.preventDefault();
    this.sendVerificationCode();
  }

  changeEmail(event: Event) {
    event.preventDefault();
    this.currentStep = 1;
    this.verificationCode = new Array(6).fill('');
    this.stopCountdown();
  }

  startCountdown() {
    this.countdownMinutes = 5;
    this.countdownSeconds = 0;
    
    this.countdownInterval = setInterval(() => {
      if (this.countdownSeconds > 0) {
        this.countdownSeconds--;
      } else if (this.countdownMinutes > 0) {
        this.countdownMinutes--;
        this.countdownSeconds = 59;
      } else {
        this.stopCountdown();
        this.errorMessage = 'Le code a expiré. Veuillez en demander un nouveau.';
      }
    }, 1000);
  }

  stopCountdown() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  clearError() {
    this.errorMessage = '';
    this.codeError = false;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  ngOnDestroy() {
    this.stopCountdown();
  }
}